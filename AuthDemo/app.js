var express         = require('express'),
    app             = express(),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    flash           = require('connect-flash'),
    bodyParser      = require('body-parser'),
    port            = process.env.PORT || 8080,
    session         = require('express-session');

var router          = require('./routes');

var LocalStrategy        = require('passport-local').Strategy,
    FacebookStrategy     = require('passport-facebook').Strategy,
    User       			 = require('./models/user'),
    configAuth 			 = require('./config/auth');

mongoose.connect("mongodb://localhost/facebook-auth"); // connect to our database

// set up our express application
app.use(bodyParser.urlencoded({extended:true})); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: "Luffy is gonna be the Pirate King!", //this is used to encode and decode the sessions
    resave: false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Passport configuration 
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


// FACEBOOK 
passport.use(new FacebookStrategy({
    // pull in our app id and secret from our auth.js file
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL

},
// facebook will send back the token and profile
function(token, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function() {
        // find the user in the database based on their facebook id
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
            if (err)
                return done(err);

            if (user) {
                return done(null, user); // user found, return that user
            } else {
                // if there is no user found with that facebook id, create them
                var newUser            = new User();
                // set all of the facebook information in our user model
                newUser.facebook.id    = profile.id; // set the users facebook id                   
                newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                newUser.facebook.name  = profile.displayName; // pull name from profile displayName
                profile.emails ? newUser.facebook.email = profile.emails[0].value : newUser.facebook.email = "no email"; // if email isn't released from fb then set to "no email"

                // save our user to the database
                newUser.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, newUser);
                });
            }

        });
    });

}));

// ROUTES 
router(app,passport);

// listen
app.listen(port, process.env.IP, function() {
	console.log("Server running on port " + process.env.PORT);
});