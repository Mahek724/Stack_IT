const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const callbackURL =
  process.env.NODE_ENV === "production"
    ? "https://stackit-backend-6nrt.onrender.com/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,  // ✅ use full absolute URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        return done(null, false, { message: 'No account found. Please sign up manually first.' });

      } catch (err) {
        return done(err, null);
      }
    }
  )
);
