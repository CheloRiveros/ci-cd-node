/* eslint-disable no-console */
const http = require("http");
const debug = require("debug")("backend:server");

module.exports = function (app) {
  const port = process.env.PORT || 8080;
  app.set("port", port);
  const server = http.createServer(app);
  if (process.env.NODE_ENV !== 'test') server.listen(port);

  function onError(error) {
    if (error.syscall !== "listen") {
      throw error;
    }
    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    const addr = server.address();
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
  }

  server.on("error", onError);
  server.on("listening", onListening);

  return server;
};
