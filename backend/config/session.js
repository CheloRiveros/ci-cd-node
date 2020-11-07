const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("../passport/config");

module.exports = function (app) {
  app.use(session({ secret: process.env.SESSION_KEY }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());
};
