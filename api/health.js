const mongoose = require('mongoose');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://fisika-simulator.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let dbStatus = 'Disconnected';
    let mode = 'Demo Mode';

    // Debug connection state
    console.log('Mongoose connection readyState:', mongoose.connection.readyState);
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

    // Try to connect if not connected
    if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Check connection after potential connection attempt
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'Connected';
      mode = 'Full Features';
      console.log('Database connection confirmed');
    } else {
      console.log('Database connection failed, readyState:', mongoose.connection.readyState);
    }

    res.status(200).json({
      status: 'OK',
      database: dbStatus,
      mode: mode,
      timestamp: new Date().toISOString(),
      debug: {
        connectionState: mongoose.connection.readyState,
        mongoUriSet: !!process.env.MONGODB_URI
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      database: 'Error',
      mode: 'Maintenance',
      error: error.message,
      debug: {
        connectionState: mongoose.connection.readyState,
        mongoUriSet: !!process.env.MONGODB_URI
      }
    });
  }
}