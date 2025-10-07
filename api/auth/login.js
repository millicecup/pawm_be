const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import User model - check this path matches your register.js
const User = require('../../src/models/User');

export default async function handler(req, res) {
  // CORS headers (multiple origins)
  const allowedOrigins = [
    'https://fisika-simulator.vercel.app',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ENSURE DATABASE CONNECTION
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected for login');
    }

    const { email, password } = req.body;

    console.log('=== LOGIN DEBUG ===');
    console.log('Login attempt for email:', email);

    // Find user - try different approach
    console.log('Searching for user...');
    const user = await User.findOne({ 
        $or: [
        { email: email },
        { email: email.toLowerCase() }
        ]
    });
    
    if (!user) {
        console.log('User not found in database');
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', {
        id: user._id,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
    });

    // Check if password field exists
    if (!user.password) {
        console.log('ERROR: User found but no password field!');
        return res.status(500).json({ message: 'User data corrupted' });
    }

    // Check password
    console.log('Comparing passwords...');
    console.log('Input password:', password);
    console.log('Stored hash length:', user.password.length);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
        console.log('Password comparison failed');
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password verified successfully');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'shower',
      { expiresIn: '24h' }
    );

    console.log('JWT token generated successfully');
    console.log('=== LOGIN SUCCESS ===');

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Detailed login error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Database error',
      error: error.message,
      debug: {
        mongoConnected: mongoose.connection.readyState === 1,
        userModelExists: !!User
      }
    });
  }
}