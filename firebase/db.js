var firebase = require('firebase');

/* Firebase Specific config */
var config = {
  authDomain: 'ftr.firebaseapp.com/',
  databaseURL: 'https://ftr.firebaseio.com'
};
firebase.initializeApp(config);

/* Global firebase db  reference */
var db = firebase.database()

function testWrite(link, jsondata) {
	db.ref(link).set(jsondata);
}

testWrite('/testData/user1', {name:"utkrist", address: "bonn"});
