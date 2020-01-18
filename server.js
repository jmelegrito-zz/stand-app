/*  EXPRESS SETUP  */
var express = require('express');
var app = express();
const models = require('./models');
const session = require("express-session");
const bodyParser = require('body-parser');

var pbkdf2 = require('pbkdf2');
var salt = "XZoLh12Teu";

function encryptionPassword(password) {
  console.log(password)
  console.log(typeof password)
  var key = pbkdf2.pbkdf2Sync(
    password, salt, 36000, 256, 'sha256'
  );
  var hash = key.toString('hex');

  return hash;
}

app.use(session({
  secret: "cats", 
  resave: true, 
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

const port = 3000;
app.listen(port , () => console.log('App listening on port ' + port));

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page 
app.get('/', function(req, res) {
    res.render('pages/index', {});
});

// signin page 
app.get('/signin', function(req, res) {
    res.render('pages/signin', {});
});

app.use(express.static(__dirname + '/public'));

// profile page 
app.get('/profile', function(req, res) {
    res.render('pages/profile');
});

// tasks page 
app.get('/tasks', function(req, res) {
  if(req.isAuthenticated()) {
    res.render('pages/tasks');
  } else {
    res.send("You are not authorized to access this page.");
  }
});

/*  PASSPORT SETUP  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/error', function(req, res) {res.send("There was an error logging you in. Please try again later.")});

app.get('/sign-out', function(req, res) {
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
  User.findOne({ where: { id: id } }).then(function (user) {
    cb(null, user);
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
        console.log("no user")
        return done(null, false);
      }

      if (user.password != encryptionPassword(password)) {
        console.log("wrong password")
        return done(null, false);
      }
      console.log("user logged in")
      return done(null, user);
    }).catch(function (err) {
      return done(err);
    });
  }
));

app.post('/sign-in',
  passport.authenticate('local', { successRedirect: "/tasks", failureRedirect: '/error' }));

  app.post("/sign-up", function (req, response) {
    models.user.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username, 
      email: req.body.email,
      password: encryptionPassword(req.body.password),
      groupsID: req.body.groupsID
    })
      .then(function (user) {
        response.redirect("/tasks?"+user.id);
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
  clientID: "92085679053-5sktg8v6ljejhchh96mum7dsnk62dq6i.apps.googleusercontent.com",
  clientSecret: "TWN3hhg9gga4KehBxxYWqOZ4",
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log (profile)
    console.log (typeof profile.id)
    models.user.findOrCreate({where: { 
      lastName: profile.name.familyName,
      firstName: profile.name.givenName, 
      googleID: profile.id,
      email: profile.emails[0].value,
    }}).then( function (err, user) {
      return cb(err, user);
    });
  }
));


//Express google template
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/tasks');
  });
