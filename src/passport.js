var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var users = require("./models/users");
var passport = require("passport");

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({

        clientID        : "430650501688-00s618jd1j3rjqcvp19rb6vqek7o6hha.apps.googleusercontent.com",
        clientSecret    : "gxpQL4SmCMUkkCOhfCX4RLCc",
        callbackURL     : "http://localhost:8080/oauth2callback",
        //http://localhost:3000/oauth2callback
    },
    function(token, refreshToken, profile, done) {
        // try to find the user based on their google id
        users.findOne({'email': profile.emails[0].value}, function(err, user) {
            console.log(user);
            if (err) {
                console.log("ERR");
                return done(err);
            }
            if (user && user.id) {
                console.log("returning");
                console.log(user.id);
                // if a user is found, log them in
                return done(null, user);
            } else if(user && !user.id){
                //convert this to just adding the name
                console.log("paid");
                user.update({
                    id:profile.id,
                    name:profile.displayName
                }, {new: true}, function(){
                    users.findOne({id:profile.id},function(err,user){
                        //console.log(user);
                        return done(null,user);
                    });
                });
            } else{
                console.log("Not Registered");
                done(null, false, { message: 'Not Registered.'});
            }
        });

    }));

module.exports = passport;
