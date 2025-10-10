const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const { allowCors } = require('../_cors');

async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    }

    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user registered with OAuth
    if (!user.password) {
      console.log('OAuth user attempted password login');
      return res.status(401).json({ 
        message: `This account was registered with ${user.authProvider}. Please use ${user.authProvider} to login.` 
      });
    }

    // Verify password - PROPER VALIDATION
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', user.email);

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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

module.exports = allowCors(handler);