const { User } = require("../models/user");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      passReqToCallback: true,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/auth/api/login/callback",
    },
    async (req, accessToken, refreshToken, profile, cb) => {
      if (!profile || !profile.id) {
        return cb(new Error('No profile returned from Google'), null);
      }
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        cb(null, profile);
      } else {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
          name: profile.displayName || '',
          profilePic: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        });
        cb(null, profile);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
