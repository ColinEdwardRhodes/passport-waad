# Windows Azure Active Directory Passport.js Plug-In - Modified by Colin Rhodes

[Passport](http://passportjs.org/) is authentication middleware for Node.js. Passport can be used in any Express-based web application. A comprehensive and large set of strategies support authentication using a username and password, Facebook, Twitter, and more. In order to enable you to quickly integrate Windows Azure Active Directory in to your website quickly, we have developed a strategy for Windows Azure Active Directory.

This code is based on passport-azure-ad, a Microsoft open source project (apache license).

## Configuration

This module relies on a great deal of configuration at Azure and also the provision of a configuration file.

```javascript
{
    "appUrl": "https://passporttestazure-colinedwardrhodes.c9.io",
    "identityMetadata" : "https://login.windows.net/1ad458eb-55b8-484b-b1b7-379be2dd07f6/federationmetadata/2007-06/federationmetadata.xml",
    "loginCallback" :"https://passporttestazure-colinedwardrhodes.c9.io/login/callback/",
    "issuer" : "https://passporttestazure-colinedwardrhodes.c9.io",
    "logoutCallback" : "https://passporttestazure-colinedwardrhodes.c9.io/logout/callback/",
    "privateCert" : "./certs/private.pem",
    "publicCert" : "./certs/public.pem"
}
```

## Installation

```
$ npm install passport-waad
```

## Usage

This sample uses a SAML protocol with express.  Please pay close attention to the order of the calls - they are order specific!

Please use the middleware ```ensureAuthenticated``` on routes to ensure users cannot access them without passing auth.

```javascript
/*
 *  Demonstration app for passport-saml
 */

 "use strict";

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , ehtPassport = require('../../lib/passport-azure-ad/index').ehtPassport;
  
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser('your secret here'));
app.use(express.session({ secret: 'keyboard cat' }));

// Creating the auth object wires passport under the hood.
var auth = new ehtPassport.ehtPassport({
  configurationFile : 'ehtPassport/config.json',
  passport : passport,
  name : 'saml',
  app : app
});

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.get('/', function(req, res){
  if(req.user) {
    res.render('index', { group: req.user.group, message: 'user', email : req.user.email});
  } else {
    res.render('notLoggedIn', { } );
  }
});

// Order of routes is important!!
auth.setSSORoutes();

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

```

## License
Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved. Licensed under the Apache License, Version 2.0 (the "License"); 
