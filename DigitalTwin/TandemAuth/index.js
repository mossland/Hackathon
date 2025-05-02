require('dotenv').config({
    path: '.env.local'
});

var express = require('express');
var app = express();
var server = require('http').Server(app);  

//get token route
var tokenRoute = require('./token');  
app.use('/token', tokenRoute.router);  

//set port
app.set('port', process.env.PORT || 1234);

server.listen(app.get('port'), function() {
    console.log('Server listening on port ' 
        + server.address().port);
});

//start oAuth process
tokenRoute.startoAuth();



