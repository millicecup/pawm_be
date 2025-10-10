const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  // OAuth fields
  googleId: {
    type: String,
    sparse: true
  },
  githubId: {
    type: String,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  avatar: {
    type: String
  },
  // Profile fields
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },
  institution: {
    type: String,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  grade: {
    type: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      achievements: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 1
  },
  totalStudyTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// // Hash password before saving (only for local auth)
// userSchema.pre('save', async function(next) {
//   // Only hash password if it exists and has been modified
//   if (!this.password || !this.isModified('password')) return next();
  
//   try {
//     // Hash password with cost of 12
//     const hashedPassword = await bcrypt.hash(this.password, 12);
//     this.password = hashedPassword;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Validate password requirement for local auth
userSchema.pre('save', function(next) {
  if (this.authProvider === 'local' && !this.password) {
    return next(new Error('Password is required for local authentication'));
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;