var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var users = require("./models/users");
var passport = require("passport");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    users.findById(id,function(err,rUser){
        if(err){
        }
        else{
            done(null, rUser);
        }
    });
});

passport.use(new GoogleStrategy({

        clientID        : "430650501688-00s618jd1j3rjqcvp19rb6vqek7o6hha.apps.googleusercontent.com",
        clientSecret    : "gxpQL4SmCMUkkCOhfCX4RLCc",
        callbackURL     : "http://lvillesplash.com/oauth2callback"
    },
    function(token, refreshToken, profile, done) {
        // try to find the user based on their google id
        users.findOne({'email': profile.emails[0].value}, function(err, user) {
            console.log(user);
            if (err) {
                console.log("ERR");
                return done(err);
            }
            if (user && user.name) {
                console.log("returning");
                // if a user is found, log them in
                return done(null, user);
            }
            else if(user && !user.name){
                //if the user is registered and this is the first time signing in
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
            }
            else{
                console.log("Not Registered");
                done(null, false, { message: 'Not Registered.'});
            }
        });

    }));

module.exports = passport;
