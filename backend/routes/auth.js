require("dotenv").config();
const express = require("express");
const passport = require("passport");

const router = express.Router();

module.exports = function () {
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  // GET /auth/google/redirect
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  router.get(
    "/google/redirect",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      const { token, username } = req.user;
      res.redirect(
        `${process.env.FRONTEND_URL}?token=${token}&username=${username}`
      );
    }
  );

  return router;
};
