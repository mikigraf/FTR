var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
require('./configuration.js')();

var trivago = 'api.trivago.com/webservice/tas';
var skyscanner = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/{market}/{currency}/{locale}/{originPlace}/{destinationPlace}/{outboundPartialDate}/{inboundPartialDate}?apiKey={apiKey}';
var skyscannerTest = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/DE/EUR/en-GB/UK/anywhere/anytime/anytime?apiKey=';
var skyscannerPlace = 'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/{market}/{currency}/{locale}/?id={id}&apiKey={apiKey}'

app.get('/test/:from/:destination/:start/:untill/:price', function (req, res) {
    
    /*
    example url: http://localhost:8080/test/lon/pl/2016-08-25/2016-08-30/1000
    */
    // skyscannerGetter('UK',req.params.from,req.params.destination,req.params.start,req.params.untill,req.params.price);
    skyscannerGetterCity('UK',req.params.from,req.params.destination,req.params.start,req.params.untill,req.params.price);
});

var skyscannerGetter = function(userCountry,from,to,datefrom,dateto,price){
    var currentUrl = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/' + userCountry + '/EUR/en-GB/' + from + '/' + to + '/' + datefrom + '/' + dateto + '?apiKey=' + skyscannerKey;
    http.get(currentUrl, function(res) {
        var response = '';
        res.on("data", function(chunk) {
            response += chunk;
        });
        var underBudget = ' ';
        res.on("end", function(){
            var data = JSON.parse(response);
            var flights = [];
            console.log(data);
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
                    var referral = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/" + userCountry + "/EUR/en-GB/" + origin + "/" + desti + "/" + datefrom + "/" + dateto + "?apiKey=" + skyscannerKey.substring(0,15) ;
                    /*
                    http.get(referral, function(res){
                        console.log(origin + " | " + o["Price"] + "->" + desti + " " + res);

                    }); */
                    console.log(origin + " | " + o["Price"] + "->" + desti + " " + referral);
                    flights.push(o);
                }
             });
            flights.sort(function(a,b){
                return a["Price"]-b["Price"];
            });
        });
    });      
}

var skyscannerGetterCity = function(userCountry,from,to,datefrom,dateto,price){
    var currentUrl = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/' + userCountry + '/EUR/en-GB/' + from + '/' + to + '/' + datefrom + '/' + dateto + '?apiKey=' + skyscannerKey;
    http.get(currentUrl, function(res) {
        var response = '';
        res.on("data", function(chunk) {
            response += chunk;
        });
        var underBudget = ' ';
        res.on("end", function(){
            var data = JSON.parse(response);
            var flights = [];
            //console.log(data);
            data[Object.keys(data)[1]].forEach(function(o){
                //console.log(o);
                if((o["MinPrice"] < price)){
                    var referral = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/" + userCountry + "/EUR/en-GB/" + from + "/" + to + "/" + datefrom + "/" + dateto + "?apiKey=" + skyscannerKey.substring(0,15);
                    console.log(referral); 
                }
                 
            });
            
            flights.sort(function(a,b){
                return a["Price"]-b["Price"];
            });
        });
    })
}

// var currentUrl = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/' + userCountry + '/EUR/en-GB/' + from + '/' + to + '/' + datefrom + '/' + dateto + '?apiKey=' + skyscannerKey;
    
//     http.get(currentUrl, function(res) {
//         var response = '';
//         res.on("data", function(chunk) {
//             response += chunk;
//         });
        
//         var underBudget = ' ';
//         res.on("end", function(){
//             var data = JSON.parse(response);
//             console.log(data);
//             var flights = [];
//             data[Object.keys(data)[1]].forEach(function(o){
//               console.log(o);
//                 if((o["Price"] < price)){
//                     var referral = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/" + userCountry + "/EUR/en-GB/" + from + "/" + to + "/" + datefrom + "/" + dateto + "?apiKey=" + skyscannerKey.substring(0,15) ;
                   
//                     console.log(from + " | " + o["Price"] + "->" + to + " " + referral);
//                 }
//                     //var origin = find(o["OriginId"]);
//                     //var desti = find(o["DestinationId"]);
//                     //var referral = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/" + userCountry + "/EUR/en-GB/" + origin + "/" + desti + "/" + datefrom + "/" + dateto + "?apiKey=" + skyscannerKey.substring(0,15) ;
                   
//                     /*
//                     http.get(referral, function(res){
//                         console.log(origin + " | " + o["Price"] + "->" + desti + " " + res);

//                     }); 
//                     console.log(origin + " | " + o["Price"] + "->" + desti + " " + referral);
//                     flights.push(o); */
//                 //}
//             // });
//             flights.sort(function(a,b){
//                 return a["Price"]-b["Price"];
//             });
//         });
//     });      



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