const mongoose = require('mongoose');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('MongoDB URI from env:', process.env.MONGODB_URI ? 'EXISTS' : 'MISSING');
    console.log('Connection state:', mongoose.connection.readyState);
    
    if (!process.env.MONGODB_URI) {
      return res.json({
        error: 'MONGODB_URI environment variable is missing',
        envVars: Object.keys(process.env).filter(key => key.includes('MONGO'))
      });
    }

    if (mongoose.connection.readyState !== 1) {
      console.log('Attempting manual connection...');
      await mongoose.connect(process.env.MONGODB_URI);
    }

    res.json({
      message: 'Database connection test',
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Missing',
      connectionState: mongoose.connection.readyState,
      connectionStateText: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }[mongoose.connection.readyState]
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.json({
      error: error.message,
      mongoUri: process.env.MONGODB_URI ? 'Set but invalid' : 'Missing'
    });
  }
}