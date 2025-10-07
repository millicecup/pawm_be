const mongoose = require('mongoose');

export default async function handler(req, res) {
  // Set CORS headers untuk frontend domain
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

    if (mongoose.connection.readyState === 1) {
      dbStatus = 'Connected';
      mode = 'Full Features';
    }

    res.status(200).json({
      status: 'OK',
      database: dbStatus,
      mode: mode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      database: 'Error',
      mode: 'Maintenance',
      error: error.message
    });
  }
}