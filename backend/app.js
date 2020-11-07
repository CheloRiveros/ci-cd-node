require("dotenv").config();
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");

// Setup server
const app = express();
const server = require("./config/express")(app);

// view engine setup
app.set("views", path.join(__dirname, "views")); 
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Setup session and passport middleware
require("./config/session")(app);

// Setup AWS sdk
require("./config/aws")();

// Setup web sockets
const io = require("./lib/sockets")(server);

// Setup routes
require("./lib/routes")(app, io);

module.exports = app;
