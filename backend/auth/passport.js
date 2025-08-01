const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Check if user already exists by email
        let user = await User.findOne({ email });

        if (user) {
          // Link Google ID if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user); // ✅ Login success
        }

        // Block new Google-only signups
        return done(null, false, { message: 'No account found. Please sign up manually first.' });

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user ID to session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user from ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
