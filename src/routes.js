var express = require("express");
var router = express.Router();
var users = require("./models/users");
var passport = require("./passport");

router.get("/leaderboard",function(req, res){
    users.find({},function(err,rUsers){
        //implement leaderboard filter
        if(err){
            return res.status(500).json({message: err.message});
        }
        else{
            var leaderboard = [];
            rUsers.forEach(function(user){
                if(user.kills != null && user.kills != null && user.kills > 0){
                    leaderboard.push({name: user.name, kills: user.kills});
                }
            });
            //change this to something more secure in the future
            res.json({leaderboard: leaderboard});
        }
    })

});

router.get("/profile",isLoggedIn,function(req,res){
    res.sendFile("/public/profile.html", {'root': './'});
});

router.get("/profiledata",isLoggedIn,function(req,res){
    var profile = {
        name:req.user.name,
        kills:req.user.kills,
        recentKills:req.user.recentKills,
        alive:req.user.alive,
        next:req.user.next,
        code:req.user.code
    }
    console.log("profile");
    console.log(profile);
    res.json({profile:profile});
});

router.get("/admin",isAdmin,function(req,res){
    res.sendFile("/public/admin.html", {'root': './'});
});

router.get("/admindata",isAdmin,function(req,res){
    users.count({email: {$exists:true}}, function (err, count){
        console.log(count);
    });
    users.find({alive:true},function(err,rUsers){
        if(err){
            return res.status(500).json({message: err.message});
        }
        else{
            //if next set then send it in that format
            res.send({adminData:rUsers});
        }
    });
});

router.post("/register",isAdmin,function(req,res){
    if(req.body.email.length > 4){
        users.find({code:{$exists:true}}).sort({_id: -1}).limit(1).find(function(err,lUser){
            if(lUser.length > 0 && lUser[0].code){
                code = lUser[0].code + Math.floor(Math.random() * 100);
            }
            else{
                console.log("first");
                code = 10001;
            }
            //probably change some of this to be created when registered
            users.count({email: req.body.email + "@lawrenceville.org"}, function (err, count){
                if(count>0){
                    res.status(400).send({
                        message: 'Already Exists'
                    });
                }
                else{
                    users.create({
                        code: code,
                        kills: 0,
                        email: req.body.email + "@lawrenceville.org",
                        alive: true,
                        admin: false
                    }, function(){
                        users.find({alive:true},function(err,rUsers){
                            res.status(201).send({
                                adminData: rUsers
                            });
                        });
                    });
                }
            });
        });
    }
});
//add brute force prevention here
router.post("/eliminate",function(req,res){
    users.findOne({code:req.code},function(err,rUser){
        if(req.user.next == rUser.code && req.user.alive){
            console.log(rUser.email + "elimanted");
        }
        else{
            console.log("wrong result");
        }
    });
});

router.post("/addadmin",function(req,res){
    users.count({email: req.body.email + "@lawrenceville.org"}, function (err, count){
        if(count>0){
            res.status(400).send({
                message: 'Already Exists'
            });
        }
        else if(req.body.email.length > 4){
            res.status(400).send({
                message: 'Not Valid Email'
            });
        }
        else{
            users.create({
                email: req.body.email + "@lawrenceville.org",
                admin: true
            });
        }
    });
});

router.get("/randomize",isAdmin,function(req,res){
    users.find({alive:true},function(err,aUsers){
        notAssignedList = aUsers.map(function (item) { return item; });
        firstUser = notAssignedList.splice(Math.floor(Math.random()*notAssignedList.length),1)[0];
        lastUser = firstUser;
        while(notAssignedList.length > 0){
            randUser = notAssignedList.splice(Math.floor(Math.random()*notAssignedList.length),1)[0];
            console.log(lastUser.email + " " + randUser.email);
            users.findOneAndUpdate({email:lastUser.email},
                {$set:{next:randUser.email}},{new:true},function(err,user){
                    if(err){
                        console.log(err);
                    }
                });
            console.log(notAssignedList.length);
            lastUser = randUser;
        }
        console.log(lastUser.email + " " + firstUser.email);
        users.findOneAndUpdate({email:lastUser.email},
            {$set:{next:firstUser.email}},{new:true},function(err,user){
                if(err){
                    console.log(err);
                }
            });
        console.log("done random");
    });

});

router.get('/oauth2', passport.authenticate('google', { scope : ['profile', 'email'] }));

router.get('/oauth2callback',
   passport.authenticate('google', {
           successRedirect : '/profile',
           failureRedirect : '/'
}));

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		return next();
    }

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function isAdmin(req,res,next) {
    if (req.isAuthenticated() && req.user.admin == true){
		return next();
    }
	// if they aren't redirect them to the home page
	res.redirect('/profile');
}

module.exports = router;
