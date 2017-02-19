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
                if(user.kills != null  && user.kills > 0){
                    if(user.name != null){
                        leaderboard.push({name: user.name, kills: user.kills});
                    }
                    else{
                        leaderboard.push({name: user.email, kills: user.kills});
                    }
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
    users.findOne({name:req.user.name},function(err,rUser){
        console.log(rUser);
        var profile = {
            email:rUser.email,
            name:rUser.name,
            kills:rUser.kills,
            lastKillDate:rUser.lastKillDate,
            alive:rUser.alive,
            next:rUser.next,
            admin:rUser.admin,
            code:rUser.code
        }
        res.json({profile:profile});
    });

});

router.get("/admin",isAdmin,function(req,res){
    res.sendFile("/public/admin.html", {'root': './'});
});

router.get("/admindata",isAdmin,function(req,res){
    users.find({alive:true}).sort({sortIndex:1}).find(function(err,rUsers){
        if(err){
            return res.status(500).json({message: err.message});
        }
        else{
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
                code = 10001;
            }
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
                        users.find({alive:true}).sort({sortIndex:1}).find(function(err,rUsers){
                            if(err){
                                return res.status(500).json({message: err.message});
                            }
                            else{
                                res.send({adminData:rUsers});
                            }
                        });
                    });
                }
            });
        });
    }
});

//add brute force prevention here
router.post("/eliminate",function(req,res){
    console.log(req.body.eliminateCode);
    users.findOne({code:req.body.eliminateCode},function(err,rUser){
        //might need to change the sortIndex
        console.log(req.user);
        if(rUser != null && req.user.alive && req.user.next == rUser.email ){
            users.findOneAndUpdate({email:req.user.email},
                {$set:{next:rUser.next},$inc:{kills:1}},{new:true},function(err){
                    if(err){
                        console.log(err);
                    }
                });

            rUser.alive = false;
            rUser.next = null;
            rUser.save();
            res.status(200).send();
        }
        else{
            res.status(400).send();
            console.log("wrong code");
        }
    });
});

router.get("/randomize",isAdmin,function(req,res){
    users.find({alive:true},function(err,aUsers){

        notAssignedList = aUsers.map(function (item) { return item; });
        firstUser = notAssignedList.splice(Math.floor(Math.random()*notAssignedList.length),1)[0];
        lastUser = firstUser;
        index = 0;

        while(notAssignedList.length > 0){
            randUser = notAssignedList.splice(Math.floor(Math.random()*notAssignedList.length),1)[0];
            console.log(lastUser.email + " " + randUser.email);

            users.findOneAndUpdate({email:lastUser.email},
                {$set:{next:randUser.email,sortIndex:index}},{new:true},function(err,user){
                    if(err){
                        console.log(err);
                    }
                });

            console.log(notAssignedList.length);
            lastUser = randUser;
            index++;
        }
        console.log(lastUser.email + " " + firstUser.email);
        users.findOneAndUpdate({email:lastUser.email},
            {$set:{next:firstUser.email,sortIndex:index}},{new:true},function(err,user){
                if(err){
                    console.log(err);
                }
                else{
                    users.find({alive:true}).sort({sortIndex:1}).find(function(err,rUsers){
                        if(err){
                            return res.status(500).json({message: err.message});
                        }
                        else{
                            res.send({adminData:rUsers});
                        }
                    });
                }
            });
    });

});

router.get("/clearnext",isAdmin,function(req,res){
    users.update({admin:false},{next:null});
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
    //should probably update this to be more secure
    if (req.isAuthenticated() && req.user.admin == true){
		return next();
    }
	// if they aren't redirect them to the home page
	res.redirect('/profile');
}

module.exports = router;
