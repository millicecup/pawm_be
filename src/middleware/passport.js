const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Check if OAuth credentials are configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && 
                          process.env.GOOGLE_CLIENT_SECRET &&
                          process.env.GOOGLE_CLIENT_ID !== 'dummy-not-configured';

const isGitHubConfigured = process.env.GITHUB_CLIENT_ID && 
                          process.env.GITHUB_CLIENT_SECRET &&
                          process.env.GITHUB_CLIENT_ID !== 'dummy-not-configured';

// Google OAuth Strategy (only if configured)
if (isGoogleConfigured) {
  console.log('✅ Google OAuth enabled');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        // Update Google ID if user exists but doesn't have it
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value,
        isActive: true,
        authProvider: 'google'
      });

      await user.save();
      done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      done(error, null);
    }
  }));
} else {
  console.log('⚠️  Google OAuth disabled (credentials not configured)');
}

// GitHub OAuth Strategy (only if configured)
if (isGitHubConfigured) {
  console.log('✅ GitHub OAuth enabled');
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback",
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ 
        $or: [
          { githubId: profile.id },
          { email: profile.emails && profile.emails[0]?.value }
        ]
      });

      if (user) {
        // Update GitHub ID if user exists but doesn't have it
        if (!user.githubId) {
          user.githubId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // Create new user
      user = new User({
        githubId: profile.id,
        name: profile.displayName || profile.username,
        email: profile.emails && profile.emails[0]?.value,
        avatar: profile.photos && profile.photos[0]?.value,
        isActive: true,
        authProvider: 'github'
      });

      await user.save();
      done(null, user);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      done(error, null);
    }
  }));
} else {
  console.log('⚠️  GitHub OAuth disabled (credentials not configured)');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Export configuration status
module.exports = passport;
module.exports.oauthStatus = {
  google: isGoogleConfigured,
  github: isGitHubConfigured
};