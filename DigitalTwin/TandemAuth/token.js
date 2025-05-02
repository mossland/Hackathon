var express = require('express');
var router = express.Router();
var fs = require('fs');  
var colors = require('colors');  

//for pop out oAuth log in dialog
var opn = require('opn'); 
var cliProgress = require('cli-progress');
var progressbar = null;  
var progressIndex = 0;
var progressInterval = 0;

var config = require('./config');  
var forgeSDK = require('forge-apis');

fs.mkdir('jobs', function() {}); 

//write the token to the file
const tokenfile = './jobs/token';  

const refreshInterval = 30; // 30 minutes 
// const refreshInterval = 0.3; // 18 seconds, just for demo


function writeTokenFile(tokenInfo){

  var refresh_token = tokenInfo.refresh_token; 
  var access_token = tokenInfo.access_token; 
  console.log('\na new access token: '.green);
  console.log('\n' + access_token);
  console.error('\na new refresh token: '.cyan);
  console.log('\n' + refresh_token); 
  
  
  //you would probably need to notify other route with the update token.
  //..... do your job....

  fs.writeFile(tokenfile,JSON.stringify({
    refresh_token:refresh_token,
    access_token:access_token}),(err) => {
      if (err) throw err;
      //refresh token in 30 minutes
      //setTimeout( refreshToken,30*60*1000); 

      progressbar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
      progressbar.start(100, 0); 
      progressIndex = 1;
      //timer for progress bar
      progressInterval = setInterval((function(){
        progressbar.update(10*progressIndex);
        progressIndex +=1;
        if(progressIndex>10){
          clearInterval(progressInterval)
          if(progressbar){
            progressbar = null; 
            delete progressbar;
           }
        }
      }),refreshInterval*60*1000/10.0); 

      //timer for get new token
      setTimeout( refreshToken,refreshInterval*60*1000); 
    });  
} 
function refreshToken(){  
  
  fs.readFile(tokenfile, (err, data) => {

    if (err) throw err;

    var thisCredentials = JSON.parse(data); 

    var forge3legged = new forgeSDK.AuthClientThreeLegged(
      config.credentials.client_id,
      config.credentials.client_secret,
      config.callbackURL,
      config.scope);
 
    forge3legged.refreshToken(thisCredentials).then(function (tokenInfo) { 
      //write token and refresh token to a file 
      writeTokenFile(tokenInfo);    
     }).catch(function (err) {
      console.log(err);
     }); 
  });
   
}

router.get('/forgeoauth',function(req,res){

  //Authorization Code
  var code = req.query.code;

  var forge3legged = new forgeSDK.AuthClientThreeLegged(
    config.credentials.client_id,
    config.credentials.client_secret,
    config.callbackURL,
    config.scope);

  forge3legged.getToken(code).then(function (tokenInfo) { 
    //write token and refresh token to a file 
    writeTokenFile(tokenInfo);    
    res.redirect('/')
  }).catch(function (err) {
    console.log(err);
    res.redirect('/')
  });
  
}); 

function startoAuth()
{   

  var url =
    "https://developer.api.autodesk.com" +
    '/authentication/v2/authorize?response_type=code' +
    '&client_id=' + config.credentials.client_id +
    '&redirect_uri=' + config.callbackURL +
    '&scope=' + config.scope.join(" ");
  
  //pop out the dialog of use login and authorization 
    opn(url, function (err) {
      if (err) throw err;
      console.log('The user closed the browser');
  }); 
}
 
module.exports = {
  router:router,
  startoAuth:startoAuth 
};
