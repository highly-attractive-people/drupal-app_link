/*eslint-env node*/
"use strict";
var fs = require("fs");
var express = require("express");
var portfinder = require('portfinder');
var html = [
  "<!DOCTYPE html>",
  "<html>",
  "<head></head>",
  "<body>",
  "<script>" + fs.readFileSync("js/app_link.js") + "</script>",
  "<script>SAMPLE_PAYLOAD=" + fs.readFileSync("test/fixtures/example-platforms.json") + "</script>",
  // "<script>app_link(SAMPLE_PAYLOAD)</script>",
  "</body>",
  "</html>"
].join("\n");

// Spin up an express server to serve it.
var app = express();
app.get("/", function (req, res) {
  res.send(html);
});
function startServer(options, callback) {
  if (!callback) {
    callback = options;
    options = {}; 
  }
  var basePort = options.port || process.env.PORT;
  if (basePort) {
    portfinder.basePort = basePort;
  }
  portfinder.getPort(function (err, port) {
    if (err) {
      return callback(err);
    }
    callback(null, app.listen(port));
  });
}

module.exports = startServer;

if (!module.parent) {
  startServer();
}
