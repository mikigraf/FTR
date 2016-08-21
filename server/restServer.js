var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
var https = require("https");
var url = require('url');
var crypto = require('crypto');
var request = require('request');
var async = require('async');
require('./configuration.js')();

var trivago = 'api.trivago.com/webservice/tas';
var trivagoTest = "api.trivago.com/webservice/tas/hotels?";
var trivagoLocation = "api.trivago.com/webservice/tas/locations?query=";
var skyscanner = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/{market}/{currency}/{locale}/{originPlace}/{destinationPlace}/{outboundPartialDate}/{inboundPartialDate}?apiKey={apiKey}';
var skyscannerTest = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/DE/EUR/en-GB/UK/anywhere/anytime/anytime?apiKey=';
var skyscannerPlace = 'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/{market}/{currency}/{locale}/?id={id}&apiKey={apiKey}'

//parameters: from, where, number of people, date period
app.get('/api/result/:from/:destination/:start/:untill/:price', function(req,res){
    //res.send(JSON.stringify({ a: 1 }));

    trivagoGetter(req.params.destination, req.params.start, req.params.untill, req.params.price);
}); 

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
    var test = skyscannerGetterCity('UK',req.params.from.substring(0,3),req.params.destination.substring(0,3),req.params.start,req.params.untill,req.params.price);
    console.log(test);
});

app.get('/trivago', function (req, res) {
    console.log("Testing successful");
    console.log(trivagoKey);
    
	var trg = trivagoGetter('london', 2016-08-26, 2016-08-30, 400); 

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
                    data[Object.keys(data)[1]].forEach(function(h){
                        if(h["QuoteId"] == o["QuoteId"]){
                            console.log(origin);
                            console.log(desti);
                            console.log(h["OutboundLeg"]);
                            console.log(h["InboundLeg"]);   
                        }
                    });

                    //console.log(o["QuoteIds"]);
                    //console.log(origin + " | " + o["Price"] + "->" + desti + " " + referral);
                    flights.push(o);
                    
                }
             });
             
              flights.sort(function(a,b){
                return a["Price"]-b["Price"];
            });
            
            /* 
            flights.forEach(function(c){
                console.log(JSON.stringify(c));
            });  */
        
        });
    });      
}


var skyscannerGetterCity = function(userCountry,from,to,datefrom,dateto,price){
    var currentUrl = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/' + userCountry + '/EUR/en-GB/' + from + '/' + to + '/' + datefrom + '/' + dateto + '?apiKey=' + skyscannerKey;
     // TODO: CALL THE TRIVAGO FUNCTION AND GET WITH THE SAME PARAMETERS. THEN APPEND THIS TO THE JSON OBJECT AND RETURN IT FROM THE INSIDE OF THIS FUNCTION
    var flights = [];
    http.get(currentUrl, function(res) {
        var response = '';
        res.on("data", function(chunk) {
            response += chunk;
        });
        var underBudget = ' ';
        res.on("end", function(){
            var data = JSON.parse(response);
            console.log(data);
            var temp = [];
            var a = 0;
            data[Object.keys(data)[1]].forEach(function(o){
                //console.log(o);
                    if(o["MinPrice"] <= 0.6*price){
                        var outbound = o["OutboundLeg"];
                        var inbound = o["InboundLeg"];
                        if(typeof outbound !== 'undefined' && typeof inbound !== 'undefined'){
                            console.log('-------------------------------------------------------------------------------');
                            console.log(from + " -> " + to);
                            console.log(o["MinPrice"]);
                            console.log(outbound["DepartureDate"]);
                            console.log(inbound["DepartureDate"]);
                            console.log('-------------------------------------------------------------------------------');
                            o['outboundDate'] = outbound["DepartureDate"];
                            o['inboundDate'] = inbound["DepartureDate"];
                            var moneyLeft = price-o["MinPrice"];
                            //trivagoGetter(to, outbound["DepartureDate"], inbound["DepartureDate"], moneyLeft);
                            var diff = (Math.abs(Date.parse(inbound["DepartureDate"].substr(0,10)) - Date.parse(outbound["DepartureDate"].substr(0,10))))/ (1000*60*60*24);
                            console.log("diff " + diff);
                        }
                        
                        o['from'] = from;
                        o['destination'] = to;
                        
                        o['referral'] = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/" + userCountry + "/EUR/en-GB/" + from + "/" + to + "/" + datefrom + "/" + dateto + "?apiKey=" + skyscannerKey.substring(0,15); 
                        if(flights.length < 3){
                            flights.push(o);
                        }
                        if(flights){
                            flights.sort(function(a,b){
                            return a["Price"]-b["Price"];
                        });
                        }
                    }
                }); 
            console.log('--------sorted-----');
            for(var l = 0; l < 3; l++){
                console.log(flights[l]["MinPrice"]);
            }
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
            console.log(flights);
        });
    });
}

app.get('/test', function (req, res) {
    console.log("Testing successful");
    console.log(trivagoKey);
    
	var trg = trivagoGetter(555, 2016-08-26, 2016-08-30, 4, 5); 

});

function create_signed_url(method, uri, access_id, secret_key) {
    var query_parameters = [],
        tokens,
        re = /(\?|\&)([^=]+)=([^&]*)/g;

    while (tokens = re.exec(uri.split('+').join(' '))) {
        query_parameters[decodeURIComponent(tokens[2])] = decodeURIComponent(tokens[3]);
    }

    query_parameters['timestamp'] = (new Date()).toISOString().split('.')[0] + 'Z';
    //console.log(query_parameters['timestamp']);
    query_parameters['access_id'] = access_id;

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

function create_location_signed_url(method, uri, access_id, secret_key) {
    var query_parameters = [],
        tokens,
        re = /(\?|\&)([^=]+)=([^&]*)/g;

    while (tokens = re.exec(uri.split('+').join(' '))) {
        query_parameters[decodeURIComponent(tokens[2])] = decodeURIComponent(tokens[3]);
    }

    query_parameters['timestamp'] = (new Date()).toISOString().split('.')[0] + 'Z';
    query_parameters['access_id'] = access_id;

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
  	var pathname = '/webservice/tas/locations'; 

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

var findPathOfLocation = function(location){
	var locationURL = 'https://' + trivagoLocation+location ;
	console.log('locationURL plain: ' +locationURL);
 
	var signedLocationURL = create_location_signed_url(
        'GET',
        locationURL,
        trivagoAccess,
        trivagoKey
    )

	console.log('locationURL signed: ' +signedLocationURL);

	var locOptions = {
	  url: signedLocationURL,
	  headers: {
			'Accept' : 'application/vnd.trivago.affiliate.hal+json;version=1', 
			'Accept-Language' : 'en-GB',
			//'Accept-Encoding' :'gzip, deflate, sdch',
			'Cookie' : 'tid=6F8x8H0k1xl4u0u5w5S2NRMBZ3'
		}
	};

	var foundPaths = [];

	function callbacklocation(error, response, body) {

		//response.on(en)
		response.on("data")
		var data = JSON.parse(body);
		console.log('BODY location: ' + body);


		var locationsTag = data[Object.keys(data)[2]];

		console.log(locationsTag[Object.keys(locationsTag)[0]]);
		var foundPaths = [];
		locationsTag[Object.keys(locationsTag)[0]].forEach(function(o){
			foundPaths.push(o[Object.keys(o)[1]]);
		});
		console.log("------ " + foundPaths[0]);
	}
	var locRequest = request(locOptions, callbacklocation);
	locRequest.end();


	return foundPaths[0];

}


var trivagoGetHotelInfo = function(foundPath, start_date, end_date,price){
	var signedURL = create_signed_url(
        'GET',
        'https://api.trivago.com/webservice/tas/hotels?currency=EUR&order=price&path='+foundPath+'&start_date=' + start_date + '&end_date=' + end_date + '&max_price=' + price ,
        trivagoAccess,
        trivagoKey
    )


	var options = {
	  url: signedURL,
	  headers: {
			'Accept' : 'application/vnd.trivago.affiliate.hal+json;version=1', 
			'Accept-Language' : 'en-GB',
			'Cookie' : 'tid=6F8x8H0k1xl4u0u5w5S2NRMBZ3'
		}
	};
 
	var hotels =  [];

	function callback(error, response, body) {
        console.log("callback");
	//	if(response.statusCode==200){
            console.log(response.statusCode);
			var mainbody = JSON.parse(body);
	       	var hotelsTag = mainbody["hotels"];

		    hotelsTag.forEach(function(o){
		       var hotelIter = [];
	           var deals = o["deals"];
	           deals.forEach(function(d){
	           		hotelIter["room_description"] = d["description"];
	           		hotelIter["booking_link"] = d["booking_link"];
                    //var diff = (Math.abs(Date.parse(start_date.substr(0,10)) - Date.parse(end_date.substr(0,10))))/ (1000*60*60*24);
                            
	           		//hotelIter["price"] = (d["price"]["formatted"])*diff;
	           		hotelIter["booking_site_name"] = d["booking_site"]["name"];
	           		hotelIter["booking_site_logo"] = d["booking_site"]["logo"];
	           		hotelIter["hotel_url"] = d["hotel_details"]["href"];
	           		//var hotelItemRequest = request()

	           		console.log(d["hotel_details"]["href"]);



	           		console.log(d["booking_site"]["logo"]);
	           });
	           hotels.push(hotelIter);
	       });
		//}	else {
            console.log("else");
			//callback(error, response, body);
            //request(options, callback);
		//}	
	
}
		

		request(options, callback);
		return hotels;
	
}

var trivagoGetter = function(location, start_date, end_date,price){	
	//var trivagoAppended = trivagoTest + "path=84565&start_date=2016-08-05T08%3A27%3A50Z&end_date=2016-08-06T08%3A27%3A50Z&access_id=" + trivagoAccess + "&timestamp=2016-08-04T08:27:50+00:00";
	var foundPath;
	var hotels ;

	 hotels = trivagoGetHotelInfo(38715, start_date, end_date, price);
	/*async.series([
		function(callback){
        	//foundPath = findPathOfLocation(location);
        	//hotels = trivagoGetHotelInfo(38715, start_date, end_date, price);
	    },
	    function(callback){
	        hotels = trivagoGetHotelInfo(38715, start_date, end_date, price);
	    },
    ]);
*/
	/*var foundPath = findPathOfLocation(location);
	
	var hotels = trivagoGetHotelInfo(foundPath, start_date, end_date, price);*/
}

var server = app.listen(8080,'127.0.0.1', function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});