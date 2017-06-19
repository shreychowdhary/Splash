var express = require("express");
var router = express.Router();
var users = require("./models/users");
var passport = require("./passport");
var throttler = require('./throttle');
var sanitize = require("mongo-sanitize");

router.get("/leaderboard", function(req, res){
    //get top 10 people with kills
    //fix it by also implemeting time sorting, because right now it is random if people have same kills
    users.find({kills:{$gt:0}}).sort({kills: -1}).limit(10).find(function(err,rUsers){

        if (err) {
            return res.status(500).json({ message: err.message });
        }
        else {
            leaderboard = [];
            rUsers.forEach(function(user){
                leaderboard.push({name:user.name,kills:user.kills});
            });
            res.json({leaderboard:leaderboard});
        }
    });

});

router.get("/profiledata",isLoggedIn,function(req,res){

    var profile = {
        name:req.user.name,
        kills:req.user.kills,
        "last Kill":req.user.lastKillDate,
        Alive:req.user.alive,
        target:req.user.target,
        code:req.user.code
    }
    //set admin true if requesting user is an admin
    if(req.user.admin == true){
        profile.admin = req.user.admin;
    }
    //update target field with name and their email
    users.findOne({email:req.user.target},function(err,rUsers){
        if(err){
            res.json({profile:profile});
        }
        else{
            if(rUsers != null && rUsers.name != null){
                profile.target = rUsers.name +" (" +req.user.target + ")";
            }

            res.json({profile:profile});
        }
    });

});

//admin page
router.get("/admin",isAdmin,function(req,res){
    res.sendFile("/public/admin.html", {'root': './'});
});
//get adminData
router.get("/admindata",isAdmin,function(req,res){
    users.find({alive:true}).sort({sortIndex:1}).find(function(err,rUsers) {
        if (err) {
            return res.status(500).json({message: err.message});
        }
        else {
            res.send({adminData:rUsers});
        }
    });
});
//signount
router.get('/signout', function(req, res){
    req.logout();
    res.redirect('/');
});

//register player
router.post("/register", isAdmin, function(req, res) {

    if (req.body.email.length > 4) {
        //find all the users with codes and find the highest one to add a random value to
        users.find({ code: { $exists: true } }).sort({ _id: -1 }).limit(1).find(function(err, lUser) {
            //add random value to last code to ex. last code 10001 new code 10013
            if (lUser.length > 0 && lUser[0].code) {
                code = lUser[0].code + Math.floor(Math.random() * 100) + 3;
            }
            else {
                //if it is the first person getting registered they get this code
                code = 10001;
            }
            //see if there is already a user with email
            users.count({ email: req.body.email + "@lawrenceville.org" }, function (err, count) {
                //already exists
                if (count > 0) {
                    res.status(400).send({
                        message: 'Already Exists'
                    });
                }
                else {
                    //create user with fields
                    users.create({
                        code: code,
                        kills: 0,
                        email: req.body.email + "@lawrenceville.org",
                        alive: true,
                        admin: false
                    }, function(){
                        //set update players list with new player to website
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

//num of players alive
router.get("/alivecount",isAdmin,function(req,res){
    users.count({alive:true},function(err,c){
        res.status(200).send({aliveCount:c});
    });
});

//insertUser in case they were falsely killed
router.post("/insertuser",isAdmin,function(req,res){
    console.log("insert");
    //find user and insert them think linked lists
    //sortIndex is to properly order the players so the target is the person above them
    users.findOneAndUpdate({email:req.body.email+"@lawrenceville.org"},{$set:{alive:true,target:req.body.prevUser.target,sortIndex:req.body.prevUser.sortIndex-1}},function(err,doc){
        if(err){
            return res.status(500).send({message: err.message});
        }
        else if(doc == null){
            res.status(400).send({message:req.body.email+"@lawrenceville.org not found"});
        }
        else{
            //remove kill from person who falsely got it
            users.findOneAndUpdate({email:req.body.prevUser.email},{$set:{target:req.body.email+"@lawrenceville.org"},$inc:{kills:-1}},function(err){
                if(err){
                    console.log(err);
                }
                else{
                    res.status(200).send({message:"Inserted " + req.body.email});
                }
            });
        }
    });
});

//kill user and give person behind them a kill
router.post("/deleteuser",isAdmin,function(req,res){
    users.findOneAndUpdate({target:req.body.user.email},{$set:{target:req.body.user.target}},function(err){
        if(err){
            console.log(err);
        }
        else{
            users.findOneAndUpdate({email:req.body.user.email},{$set:{alive:false,target:null}},function(err){
                if(err){
                    console.log(err);
                }
                else{
                    res.status(200).send({message:"Deleted " + req.body.user.email});
                }
            });
        }
    })
});


//eliminate has a brute force look at throttler
router.post("/eliminate", isLoggedIn, throttler, function(req, res) {
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    console.log(req.body.eliminateCode);
    users.findOne({code:sanitize(req.body.eliminateCode)},function(err,rUser) {
        //killday stuff
        console.log(req.user);
        curdate = new Date();
        killdate = months[curdate.getMonth()] + " " + curdate.getDate();
        //update their kill total and target
        if(rUser != null && req.user.alive && req.user.target == rUser.email){
            users.findOneAndUpdate({email:req.user.email},
                {$set:{target:rUser.target,lastKillDate:killdate},$inc:{kills:1}},{new:true},function(err){
                    if(err){
                        console.log(err);
                    }
                });
            //kill person
            rUser.alive = false;
            rUser.target = null;
            rUser.save();
            res.status(200).send({
                message:"Congratulations"
            });
        }
        else{
            res.status(400).send({
                message: 'Wrong Code'
            });
        }
    });
});

//randomize users
router.get("/randomize",isAdmin,function(req,res){
    users.find({alive:true},function(err,aUsers){


        notAssignedList = aUsers.map(function (item) { return item; });
        //remove user at random index to start list
        firstUser = notAssignedList.splice(Math.floor(Math.random()*notAssignedList.length),1)[0];
        //lastUser in list
        lastUser = firstUser;
        index = 1;

        while(notAssignedList.length > 0){
            //remove all the indexes from the array and add to list randomly
            randUser = notAssignedList.splice(Math.floor(Math.random()*notAssignedList.length),1)[0];

            users.findOneAndUpdate({email:randUser.email},
                {$set:{target:lastUser.email,sortIndex:index}},{new:true},function(err,user){
                    if(err){
                        console.log(err);
                    }
                });
            //set last user to newest addition
            lastUser = randUser;
            index++;
        }
        //set lastUser to the firstUser to create a loop
        users.findOneAndUpdate({email:firstUser.email},
            {$set:{target:lastUser.email,sortIndex:0}},{new:true},function(err,user){
                if(err){
                    console.log(err);
                }
                else{
                    users.find({alive:true}).sort({sortIndex:1}).find(function(err,rUsers){
                        if(err){
                            return res.status(500).json({message: err.message});
                        }
                        else{
                            return res.json({adminData:rUsers});
                        }
                    });
                }
            });
    });

});

//clear all the users targets
router.get("/cleartarget",isAdmin,function(req,res){
    console.log("clear");
    users.update({alive:true},{target:null,sortIndex:null},{multi: true},function(err){
        if(err){
            return res.status(500).json({message: err.message});
        }
        else{
            users.find({alive:true}).sort({sortIndex:1}).find(function(err,rUsers){
                if(err){
                    return res.status(500).json({message: err.message});
                }
                else{
                    return res.json({adminData:rUsers});
                }
            });
        }
    });

});

router.get('/oauth2', passport.authenticate('google', { scope : ['profile', 'email'] }));

router.get('/oauth2callback',
   passport.authenticate('google', {
           successRedirect : '/',
           failureRedirect : '/',
}));

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		return next();
    }

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function isAdmin(req, res, next) {
    //should probably update this to be more secure
    if (req.isAuthenticated() && req.user.admin == true){
		return next();
    }
	// if they aren't redirect them to the home page
	res.redirect('/');
}

module.exports = router;
