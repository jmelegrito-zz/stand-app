/*  EXPRESS SETUP  */

const express = require('express');
const app = express();
const models = require('./models');
const session = require("express-session");
const bodyParser = require('body-parser');

var pbkdf2 = require('pbkdf2');
var salt = "XZoLh12Teu";

function encryptionPassword(password) {
  var key = pbkdf2.pbkdf2Sync(
    password, salt, 36000, 256, 'sha256'
  );
  var hash = key.toString('hex');

  return hash;
}

app.use(session({
  secret: "cats", 
  resave: false, 
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

const port = 3000;
app.listen(port , () => console.log('App listening on port ' + port));

/*  PASSPORT SETUP  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', function (req, res) {
  if(req.isAuthenticated()) {
    res.send("Welcome " + req.user.username + "!!");
  } else {
    res.send("You are not authorized to access this page.");
  }
});

app.get('/error', function(req, res) {res.send("There was an error logging you in. Please try again later.")});

app.get('/logout', function(req, res) {
  if(req.isAuthenticated()){
    console.log("The user is logging out.");
    req.logOut();
    res.send("The user has logged out.");
  } else {
    res.send("You don't have a session open.");
  }
});

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});





/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username, password, done) {
    models.user.findOne({
      where: {
        username: username
      }
    }).then(function (user) {
      if (!user) {
        return done(null, false);
      }

      if (user.password != encryptionPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    }).catch(function (err) {
      return done(err);
    });
  }
));

app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success?username='+req.user.username);
  });

  app.post("/sign-up", function (req, response) {
    models.user.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username, 
      password: encryptionPassword(req.body.password),
      email: req.body.email,
      groupsID: req.body.groupsID
    })
      .then(function (user) {
        response.send(user);
      });
  });

  app.post("/group-sign-up", function (req, response) {
    models.group.create({
      groupName: req.body.groupName
    })
      .then(function (user) {
        response.send(user);
      });
  });



//GoogleStrategy template OAuth2.0 API
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: "test",
    clientSecret: "test",
    callbackURL: "http://www.example.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
))

//Express google template
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
