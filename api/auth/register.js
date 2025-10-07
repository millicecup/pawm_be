const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import model - check if this path is correct
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
      console.log('MongoDB connected');
    }

    const { name, email, password } = req.body;

    console.log('=== REGISTRATION DEBUG ===');
    console.log('Registering with email:', email);
    console.log('User model available:', !!User);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { email: email.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Create new user
    console.log('Creating user...');
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local'
    });

    await user.save();
    console.log('User saved successfully');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'shower',
      { expiresIn: '24h' }
    );

    console.log('Registration successful');
    console.log('=== END REGISTRATION DEBUG ===');

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
    console.error('Detailed registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message, // Include actual error for debugging
      stack: error.stack?.substring(0, 200) // Limited stack trace
    });
  }
}