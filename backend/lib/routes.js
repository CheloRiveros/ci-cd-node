const createError = require("http-errors");

const chatRoomsRouter = require("../routes/chatRoom");
const authRouter = require("../routes/auth");
const idRouter = require("../routes/idEndpoint");

module.exports = function (app, io) {
  app.use("/chatrooms", chatRoomsRouter(io));
  app.use("/auth", authRouter());
  app.use("/idEnd", idRouter(io));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });
};
