var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
require('./configuration.js')();

var trivago = 'api.trivago.com/webservice/tas';
var skyscanner = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/{market}/{currency}/{locale}/{originPlace}/{destinationPlace}/{outboundPartialDate}/{inboundPartialDate}?apiKey={apiKey}';
var skyscannerTest = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/GB/GBP/en-GB/UK/anywhere/anytime/anytime?apiKey=';

app.get('/test', function (req, res) {
    console.log("Testing successful");
    console.log(sum(2,2));
    console.log(trivagoKey);
    http.get(skyscannerTest + skyscannerKey, function(res) {
        console.log("Got response: " + res.statusCode);
        res.on("data", function(chunk) {
            console.log("BODY: " + chunk);
        });
            }).on('error', function(e) {
        console.log("Got error: " + e.message);
            });
});

        console.log("Got error: " + e.message);});
//parameters: from, where, number of people, date period
app.get('/ftr/package', function(req,res){
    var fromCity = req.param('from');
    var toCity = req.param('to');
    var numPeople = req.param('people');
    var fromDate = req.param('start');
    var toDate = req.param('untill');
    var request = http.get(url, function (response) {
        console.log(response);
    });
}); 


var server = app.listen(8080,'127.0.0.1', function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})