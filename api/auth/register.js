const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const { allowCors } = require('../_cors');

export default async function handler(req, res) {
  allowCors(req, res);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    const { name, email, password } = req.body;

    console.log('=== REGISTRATION DEBUG ===');
    console.log('Registering with email:', email);
    console.log('Password length:', password ? password.length : 0);
    console.log('Password to hash:', JSON.stringify(password));

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { email: email.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Test the hash immediately after creation
    const immediateTest = await bcrypt.compare(password, hashedPassword);
    console.log('Immediate hash test:', immediateTest);

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local'
    });

    await user.save();
    console.log('User saved with email:', user.email);

    // Test the hash after saving to database
    const savedUser = await User.findOne({ email: user.email });
    console.log('Hash in database after save:', savedUser.password);
    const afterSaveTest = await bcrypt.compare(password, savedUser.password);
    console.log('After save hash test:', afterSaveTest);
    console.log('=== END REGISTRATION DEBUG ===');

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
}