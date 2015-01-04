/*
 *  Demonstration app for passport-waad.
 *
 */

 "use strict";

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , waadPassport = require('../../lib/passport-waad/index').waadPassport;
  
var app = express();

// Set to SAML or test
var authMethod = 'saml';

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser('your secret here'));
app.use(express.session({ secret: 'keyboard cat' }));

// Creating the auth object wires passport under the hood.
var auth = new waadPassport.waadPassport({
  configurationFile : 'passportConfig/config.json',
  passport : passport,
  name : authMethod, // set to test for local development
  app : app
});

var router = require('express').Router();

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.get('/', function(req, res){
  
  if(req.user) {
    res.render('index', { 
      user : req.user,
      method : auth.name
    });
  } else {
    res.render('notLoggedIn', { } );
  }
});

app.get('/user',
  auth.ensureAuthenticated,
  auth.memberOf("User", function(req,res) { 
      res.render('notWorthy', { group : 'User' } );
  }),
  function(req,res) { 
    res.render('worthy', {  group : 'User' });
  });
  
app.get('/nouser',
  auth.ensureAuthenticated,
  auth.memberOf("NoUser", function(req,res) { 
      res.render('notWorthy', { group : 'NoUser' } );
  }),
  function(req,res) { 
    res.render('worthy', {  group : 'NoUser' });
  });
  
// Order of routes is important!!
auth.setSSORoutes(router);

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.errorHandler());

http.createServer(app).listen(app.get('port'), function(){
  console.log('Sample ADFS Azure app');
  console.log('');
  console.log('NOTE: Your machine must have a fqdn, AND it must be configured in config.json');
  console.log('AND azure must be configured with callbacks to the fqdn');
  console.log('');
  console.log('Express server listening on port ' + app.get('port'));
});
