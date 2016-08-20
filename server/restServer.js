var express = require('express');
var app = express();
var passport = require('passport');
var fs = require("fs");
require('./configuration.js')();

app.get('/test', function (req, res) {
    console.log("Testing successful");
    console.log(sum(2,2));
    console.log(trivagoKey);
});

app.get('/login', function (req, res) {
  res.send('Login');
});

app.get('/register', function (req, res) {
  res.send('Register');
});

app.get('/user', function (req, res) {
  res.send('User');
});


var server = app.listen(8080,'127.0.0.1', function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
