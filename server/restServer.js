var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
require('./configuration.js')();

var trivago = 'api.trivago.com/webservice/tas';
var skyscanner = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/{market}/{currency}/{locale}/{originPlace}/{destinationPlace}/{outboundPartialDate}/{inboundPartialDate}?apiKey={apiKey}';
var skyscannerTest = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/DE/EUR/en-GB/UK/anywhere/anytime/anytime?apiKey=';
var skyscannerPlace = 'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/{market}/{currency}/{locale}/?id={id}&apiKey={apiKey}'
app.get('/test', function (req, res) {
    skyscannerGetter('UK','LON','DE','2016-08-25','2016-08-30',1000);
});

var skyscannerGetter = function(userCountry,from,to,datefrom,dateto,price){
    var currentUrl = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/' + userCountry + '/EUR/en-GB/' + from + '/' + to + '/' + datefrom + '/' + dateto + '?apiKey=' + skyscannerKey;
    http.get(currentUrl, function(res) {
        var response = '';
        res.on("data", function(chunk) {
            response += chunk;htp
        });
        var underBudget = ' ';
        res.on("end", function(){
            var data = JSON.parse(response);
            var flights = [];
            //console.log(data);
            data[Object.keys(data)[0]].forEach(function(o){
                if((o["Price"] < price)){
                    var find = function(id){
                        var found = null;
                        data[Object.keys(data)[2]].forEach(function(x){
                            var element = x["PlaceId"];
                            // console.log("Element: " + x["Name"]);
                            if(id == element){
                                found = x["Name"];
                            }
                        });
                        return found;
                    }
                    var origin = find(o["OriginId"]);
                    var desti = find(o["DestinationId"]);
                    console.log(origin + " | " + o["Price"] + "->" + desti);
                    flights.push(o);
                    // console.log("ORIGIN------------------------------------------------------------------------");
                    // http.get("http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/" + userCountry + "/EUR/en-GB/?id=" + o["OriginId"] + "&apiKey=" + skyscannerKey,function(res) {
                    //     var response = '';
                    //     res.on("data", function(chunk) {
                    //         response += chunk;
                    //     });

                    //     res.on("end", function(){
                    //         console.log("Origin: " + response);
                    //     });
                    // });
                    // console.log("DESTINATION-------------------------------------------------------------------");
                    // http.get("http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/" + userCountry + "/EUR/en-GB/?id=" + o["DestinationId"] + "&apiKey=" + skyscannerKey,function(res) {
                    //     var response = '';
                    //     res.on("data", function(chunk) {
                    //         response += chunk;
                    //     });

                    //     res.on("end", function(){
                    //         console.log("Origin: " + response);
                    //     });
                    // });
                }
                        
                        //http.get("http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/" + userCountry + "/{EUR/en-GB/?id=" + o.destination + "&apiKey=" + skyscannerKey);
            });
            flights.sort(function(a,b){
                return a["Price"]-b["Price"];
            });
            //console.log(flights);
        });
    });      
}

var trivagoGetter = function(from,to,datefrom,dateto,price){

}

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