/* eslint-disable no-console */
const AWS = require("aws-sdk");

module.exports = function () {
  AWS.config.getCredentials(function (err) {
    if (err) console.log(err.stack);
    else {
      console.log("Access key:", AWS.config.credentials.accessKeyId);
    }
  });

  AWS.config.update({ region: "us-east-1" });
};
