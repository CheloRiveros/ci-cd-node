const express = require("express");
const AWS = require("aws-sdk");

const router = express.Router();

/* GET users listing. */

module.exports = function (io) {
  router.get("/getId", async (req, res, next) => {
    const meta = new AWS.MetadataService();
    meta.request("/latest/meta-data/instance-id", function (err, data) {
      res.send(data);
    });
  });

  return router;
};
