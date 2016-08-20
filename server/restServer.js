var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
var https = require("https");
var url = require('url');
var crypto = require('crypto');
var request = require('request');
require('./configuration.js')();

var trivago = 'api.trivago.com/webservice/tas';
var trivagoTest = "api.trivago.com/webservice/tas/hotels?"
var skyscanner = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/{market}/{currency}/{locale}/{originPlace}/{destinationPlace}/{outboundPartialDate}/{inboundPartialDate}?apiKey={apiKey}';
var skyscannerTest = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/DE/EUR/en-GB/UK/anywhere/anytime/anytime?apiKey=';
var skyscannerPlace = 'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/{market}/{currency}/{locale}/?id={id}&apiKey={apiKey}'

app.get('/country/:from/:destination/:start/:untill/:price', function (req, res) {
    
    /*
    example url: http://localhost:8080/test/lon/pl/2016-08-25/2016-08-30/1000
    */
     skyscannerGetter('UK',req.params.from,req.params.destination,req.params.start,req.params.untill,req.params.price);
});

app.get('/city/:from/:destination/:start/:untill/:price', function (req, res) {
    
    /*
    example url: http://localhost:8080/test/lon/pl/2016-08-25/2016-08-30/1000
    */
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
            //console.log(data);
            data[Object.keys(data)[0]].forEach(function(o){
                if((o["Price"] < price)){
                    var find = function(id){
                        var found = null;
                        data[Object.keys(data)[2]].forEach(function(x){
                            var element = x["PlaceId"];
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

                    }); 
                    */
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

app.get('/test', function (req, res) {
    console.log("Testing successful");
    console.log(trivagoKey);
    
	var trg = trivagoGetter(555, 2016-08-26, 2016-08-30, 4, 5); 

});




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

});

function create_signed_url(method, uri, access_id, secret_key) {
    var query_parameters = [],
        tokens,
        re = /(\?|\&)([^=]+)=([^&]*)/g;

    while (tokens = re.exec(uri.split('+').join(' '))) {
        query_parameters[decodeURIComponent(tokens[2])] = decodeURIComponent(tokens[3]);
        //console.log(decodeURIComponent(tokens[3]));
    }

    // Add ISO8601 timestmap and access_id to parameters
    query_parameters['timestamp'] = (new Date()).toISOString().split('.')[0] + 'Z';
    query_parameters['access_id'] = access_id;

    // Sort query parameters
    var sorted_query_parameters = {};
    Object.keys(query_parameters).sort().forEach(function(key) {
        sorted_query_parameters[key] = query_parameters[key];
    });


    var query_string = [];
    Object.keys(sorted_query_parameters).map(function(key) {
        query_string.push(encodeURIComponent(key) + '=' + encodeURIComponent(sorted_query_parameters[key]));
    });

    query_string = query_string.join('&');

    var hostname = 'api.trivago.com'; 
  	var pathname = '/webservice/tas/hotels'; 

    var unhashed_signature = [
        method,
        hostname,
        pathname,
        query_string
    ].join("\n");

    // Add signature to parameters
    const hashedSig = crypto.createHmac('sha256', secret_key)
	                   .update(unhashed_signature)
	                   .digest('base64');
	console.log(hashedSig);

    query_string += '&signature=' + hashedSig;

    return  "https://" + hostname + pathname + '?' + query_string;
}

var trivagoGetter = function(location, start_date, end_date,price){	
	//var trivagoAppended = trivagoTest + "path=84565&start_date=2016-08-05T08%3A27%3A50Z&end_date=2016-08-06T08%3A27%3A50Z&access_id=" + trivagoAccess + "&timestamp=2016-08-04T08:27:50+00:00";

	console.log('test --');
	
	var signedURL = create_signed_url(
        'GET',
        'https://api.trivago.com/webservice/tas/hotels?path=',
        trivagoAccess,
        trivagoKey
    )

	console.log( signedURL);

	console.log('test --');

	var testRequest = https.get('https://api.trivago.com/webservice/tas/health', function(res){
		res.on("data", function(chunk){
			console.log("BODY:- " + res.statusCode + "  " + chunk );
		});
	}).on('error', function(e) {
    	console.log("Got error:- " + e.message);
    });

	var options = {
	  url: signedURL,
	  headers: {
			'Accept' : 'application/vnd.trivago.affiliate.hal+json;version=1', 
			'Accept-Language' : 'en-GB',
			'Cookie' : 'tid=6F8x8H0k1xl4u0u5w5S2NRMBZ3'
		}
	};
 
	function callback(error, response, body) {
		console.log('BODY: ' + body);
	  
	}
	 
	request(options, callback);
}
