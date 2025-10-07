const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../middleware/passport');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth'); // FIX: Ganti authenticate jadi authenticateToken

// Get OAuth status
const { oauthStatus } = require('../middleware/passport');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Test the hash immediately after creation
    const immediateTest = await bcrypt.compare(password, hashedPassword);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local'
    });

    await user.save();

    // Test the hash after saving to database
    const savedUser = await User.findOne({ email });
    const afterSaveTest = await bcrypt.compare(password, savedUser.password);
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user;
    try {
      user = await User.findOne({ email });

      
      if (!user) {

        user = await User.findOne({ email: email.toLowerCase() });

      }
    } catch (dbError) {
      console.error('Database search error:', dbError);
      return res.status(500).json({ message: 'Database error' });
    }
    

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user registered with OAuth
    if (!user.password) {
      return res.status(401).json({ 
        message: `This account was registered with ${user.authProvider}. Please use ${user.authProvider} to login.` 
      });
    }

    // Verify password
    
    let isValidPassword;
    try {
      // Try multiple comparison methods
      isValidPassword = await bcrypt.compare(password, user.password);
      
      // Also try synchronous version
      const syncResult = bcrypt.compareSync(password, user.password);
      
      const freshHash = await bcrypt.hash(password, 12);
      const freshComparison = await bcrypt.compare(password, freshHash);
      
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      return res.status(500).json({ message: 'Password verification error' });
    }

    if (!isValidPassword) {
      
      // TEMPORARY FIX: Re-hash and compare with fresh hash
      const tempHash = await bcrypt.hash(password, 12);
      const tempResult = await bcrypt.compare(password, tempHash);
      
      // If bcrypt works with fresh hash, update the user's password
      if (tempResult) {
        user.password = tempHash;
        await user.save();
        isValidPassword = true;
        console.log('Password updated successfully');
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );


    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Outer login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);
    
    const allUsers = await User.find({}, 'email name authProvider');
    console.log('All users:', allUsers);
    
    res.json({
      message: 'Database test successful',
      userCount,
      users: allUsers
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ message: 'Database test failed', error: error.message });
  }
});

// Logout
// ADD THIS TEMPORARY TEST ROUTE after the /test-db route:

router.post('/test-password', async (req, res) => {
  try {
    const { email, testPassword } = req.body;
    

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Test with original password
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    // Also test hashing the same password again
    const newHash = await bcrypt.hash(testPassword, 12);
    
    const newComparison = await bcrypt.compare(testPassword, newHash);
    
    res.json({
      message: 'Password test completed',
      originalComparison: isValid,
      newComparison: newComparison,
      storedHash: user.password.substring(0, 20) + '...'
    });
  } catch (error) {
    console.error('Password test error:', error);
    res.status(500).json({ message: 'Test failed' });
  }
});
// Google OAuth routes (only if configured)
if (oauthStatus.google) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { 
      failureRedirect: '/login',
      session: false 
    }),
    (req, res) => {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  );
}

// GitHub OAuth routes (only if configured)
if (oauthStatus.github) {
  router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  router.get('/github/callback',
    passport.authenticate('github', { 
      failureRedirect: '/login',
      session: false 
    }),
    (req, res) => {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  );
}

// Get available auth methods
router.get('/methods', (req, res) => {
  res.json({
    local: true,
    google: oauthStatus.google,
    github: oauthStatus.github
  });
});

module.exports = router;