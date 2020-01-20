/*  EXPRESS SETUP  */
const express = require('express');
const app = express();
const models = require('./models');
const session = require("express-session");
const bodyParser = require('body-parser');
const cookieSession = require("cookie-session")
const cookieParser = require("cookie-parser")
const Sequelize = require("sequelize")

var pbkdf2 = require('pbkdf2');
var salt = "XZoLh12Teu";

function encryptionPassword(password) {
  var key = pbkdf2.pbkdf2Sync(
    password, salt, 36000, 256, 'sha256'
  );
  var hash = key.toString('hex');

  return hash;
}

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ["itsakey"]
}));

app.use(cookieParser());

app.use(session({
  secret: "cats",
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

const port = 3000;
app.listen(port, () => console.log('App listening on port ' + port));

// set the view engine to ejs
app.set('view engine', 'ejs');

/*  PASSPORT SETUP  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  models.user.findOne({ where: { id: id } }).then(function (user) {
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

//GoogleStrategy template OAuth2.0 API
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: "92085679053-5sktg8v6ljejhchh96mum7dsnk62dq6i.apps.googleusercontent.com",
  clientSecret: "TWN3hhg9gga4KehBxxYWqOZ4",
  callbackURL: "/auth/google/redirect"
},
  function (accessToken, refreshToken, profile, done) {
    models.user.findOrCreate({where:{
        lastName: profile.name.familyName,
        firstName: profile.name.givenName,
        googleID: profile.id,
        email: profile.emails[0].value,
      }}).then(function (user) {
        if (user){
          return done(null, user[0]);
        } else{
          return done(null, user[0]);
      }})
      }));


//Express google template
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email']
  }));

app.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/signin'}),
  function (req, res) {
    res.redirect('/tasks');
  });

app.get('/sign-out', function (req, res) {
  if (req.isAuthenticated()) {
    console.log("The user is logging out.");
    req.logOut();
    res.redirect("/signin");
  } else {
    console.log("no open session")
    res.redirect("/signin");
  }
});

// index page 
app.get('/', function (req, res) {
  req.logOut();
  models.group.findAll({}).then(function(groups){
    res.render('pages/index', {groups:groups});
  })
  
});

// signin page 
app.get('/signin', function (req, res) {
  res.render('pages/signin', {});
});

app.use(express.static(__dirname + '/public'));

// profile page 
app.get('/profile', function (req, res) {
  const profileDeets = models.user.findOne({
    where:{
      id: req.user.id,
    }
  })
  const profileGroups = models.group.findAll({})
  Promise
    .all([profileDeets,profileGroups])
    .then(function(responses){
      res.render("pages/profile", {user: responses[0], groups: responses[1]})
    })
});

// tasks page 
app.get('/tasks', function (req, res) {
  if (req.isAuthenticated()) {
    const personal = models.task.findAll({
      where:{
        taskOwner: req.user.id,
      }
    })
    const group = models.task.findAll({
      include: [models.user],
      where:{
        projectID: req.user.groupsID,
      },
      raw: true
    })
    const owner = models.user.findAll({})
    const groupCheck = models.user.findOne({
      where:{
        id: req.user.id
      }
    })
    const grabGroup = models.group.findAll({})
Promise
    .all([personal,group,owner,groupCheck,grabGroup])
    .then(function(responses){
      res.render('pages/tasks', {tasks: responses[0], groupTask: responses[1], owner: responses[2], verifyGroup: responses[3], groups: responses[4]})
    })
  } else {
    res.redirect("/signin");
  }
});

app.post('/sign-in',
  passport.authenticate('local', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/tasks');
  });

app.post("/sign-up", function (req, response) {
  models.user.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    password: encryptionPassword(req.body.password),
    // groupsID: req.body.groupsID
  })
    .then(function (user) {
      req.login(user, function(){
        response.redirect("/tasks");
      })
    });
});

app.post("/group-sign-up", function (req, response) {
  models.group.create({
    groupName: req.body.groupName
  })
    .then(function (user) {
      response.render("/");
    });
});

app.post("/new-task", function (req, response){
  models.task.create({
    taskName: req.body.taskName,
    taskDetails: req.body.taskDetails,
    taskOwner: req.user.id,
    projectID: req.user.groupsID
  }).then(function(){
    console.log("adding new task")
    response.redirect("/tasks")
  });
})

app.post("/delete-task", function(req, response){
  models.task.create({
    where: {
      id: req.body.id
    }
  }).then(function(){
    response.redirect("/tasks")
  })
})

app.post("/update-task-status/:id", function(req, response){
  models.task.update(
    req.body,
    { where: { id: req.params.id } }
  ).then(function(){
    response.redirect("/tasks")
  })
})

app.post("/update-task-owner/:id", function(req, response){
  models.task.update(
    { taskOwner: req.body.taskOwner,
     },
    { where: { id: req.params.id } }
  ).then(function(){
    response.redirect("/tasks")
  })
})
app.post("/update-groupsID/:id", function(req, response){
  models.user.update(
    { groupsID: req.body.groupsID,
     },
    { where: { id: req.params.id } }
  ).then(function(){
    response.redirect("/tasks")
  })
})

app.post("/update-profile/:id", function(req, response){
  models.user.update(
    req.body,
    { where: { id: req.params.id } }
  ).then(function(){
    response.redirect("/profile")
  })
})