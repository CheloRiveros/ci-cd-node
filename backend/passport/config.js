require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const models = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "/api/auth/google/redirect"
          : "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      // passport callback function
      const email = profile.emails[0].value;
      const username = profile.displayName;

      // check if user already exists in our db with the given profile ID
      models.User.findOne({
        where: { email },
      }).then((currentUser) => {
        if (currentUser) {
          // if we already have a record with the given profile ID
          done(null, currentUser);
        } else {
          // if not, create a new user
          new models.User({
            email,
            username,
            token: accessToken,
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  models.User.findByPk(id).then((user) => {
    done(null, user);
  });
});

module.exports = passport;
