var mongoose = require("mongoose");
var url = process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME || "mongodb://localhost/splash";
mongoose.connect(url,
    function(err){
        if(err){
            console.log("Failed db");
        }
        else{
            console.log("Connected db");
        }
    });
