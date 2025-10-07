const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const passport = require('./middleware/passport');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/progress');
const simulationRoutes = require('./routes/simulations');
const sessionRoutes = require('./routes/sessions');
const achievementRoutes = require('./routes/achievements');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration - Allow multiple frontend ports
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'https://fisika-simulator.vercel.app/',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Session middleware (for OAuth) with fallback to memory store
console.log('📝 Setting up session store... (testing MongoDB connection)');
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  // Use memory store for simplicity (works without MongoDB)
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Database connection with graceful error handling
let isMongoConnected = false;

// ... (keep everything the same until line 92)

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/physics-lab', {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    console.log('✅ Connected to MongoDB - Full features available');
    isMongoConnected = true;
  } catch (err) {
    console.log('\n🔶 MongoDB not available - Running in demo mode');
    console.log('📱 Frontend simulations work perfectly without database');
    console.log('⚠️  User authentication and progress saving disabled');
    console.log('\n💡 To enable full features:');
    console.log('   🌐 Option 1: Use MongoDB Atlas (recommended)');
    console.log('      → Go to https://cloud.mongodb.com');
    console.log('      → Create free account and get connection string');
    console.log('   💻 Option 2: Install MongoDB locally');
    console.log('      → Download from https://www.mongodb.com/try/download/community\n');
    
    isMongoConnected = false;
  }
};


connectToMongoDB();

// Middleware to check database status
const requireDatabase = (req, res, next) => {
  if (!isMongoConnected) {
    return res.status(503).json({ 
      error: 'Database not available', 
      message: 'This feature requires database connection. Please set up MongoDB.',
      demoMode: true 
    });
  }
  next();
};

// Routes with database awareness
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/users', requireDatabase, userRoutes);
app.use('/api/progress', requireDatabase, progressRoutes);
app.use('/api/simulations', simulationRoutes); // Works without database
app.use('/api/sessions', requireDatabase, sessionRoutes);
app.use('/api/achievements', requireDatabase, achievementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: isMongoConnected ? 'Connected' : 'Not Available',
    mode: isMongoConnected ? 'Full Features' : 'Demo Mode (Simulations Only)'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend API running on: http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️  Database: ${isMongoConnected ? 'Connected' : 'Demo Mode'}`);
    console.log(`\n💡 Make sure your frontend is configured to use: http://localhost:${PORT}\n`);
  });
}

// For Vercel serverless deployment
module.exports = app;

