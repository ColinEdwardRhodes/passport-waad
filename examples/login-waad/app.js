/////////////////////////////////////////////
//
//  passport-waad sample code.
//
/////////////////////////////////////////////c

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    expressSession = require('express-session'),
    waad = require('../../lib/passport-waad').waadPassport ,
    passport = require('passport');
  
var sessionSecret = '#$&#*(*)#$*(&';
var app = express();

//
//  Middleware
//
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(cookieParser(sessionSecret));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(expressSession({ secret: sessionSecret }));

// Creating the auth object wires passport under the hood.
var auth = new waad.waadPassport({
  configurationFile : 'passportConfig/config.json',
  passport : passport,
  name : 'saml',    //set to test for dev
  app : app
});

var router = express.Router();

router.get('/', function(req, res){
  
  if(req.user) {
    res.render('index', { 
      user : req.user,
      method : auth.name
    });
  } else {
    res.render('notLoggedIn', { } );
  }
});


// Order of routes is important!!
auth.setSSORoutes(
  router,
  function(req,res,next) { 
    next();
  },
  function(req,res,next){ 
    next();
  }
);
router.get('/user',
  auth.ensureAuthenticated,
  auth.memberOf("User", function(req,res) { 
      res.render('notWorthy', { group : 'User' } );
  }),
  function(req,res) { 
    res.render('worthy', {  group : 'User' });
  });
  
router.get('/nouser',
  auth.ensureAuthenticated,
  auth.memberOf("NoUser", function(req,res) { 
      res.render('notWorthy', { group : 'NoUser' } );
  }),
  function(req,res) { 
    res.render('worthy', {  group : 'NoUser' });
  });


app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

app.listen(process.env.PORT);