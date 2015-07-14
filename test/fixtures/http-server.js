/*eslint-env node*/
"use strict";
var fs = require("fs");
var html = [
  "<!DOCTYPE html>",
  "<html>",
  "<head></head>",
  "<body>",
  "<script>" + fs.readFileSync("js/app_link.js") + "</script>",
  "</body>",
  "</html>"
].join("\n");
// Spin up an express server to serve it.
var express = require("express");
var app = express();
app.get("/", function (req, res) {
  res.send(html);
});
module.exports = app;
