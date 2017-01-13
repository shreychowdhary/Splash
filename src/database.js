var mongoose = require("mongoose");
var url = "mongodb://localhost/splash";
mongoose.connect(url,
    function(err){
        if(err){
            console.log("Failed db");
        }
        else{
            console.log("Connected db");
        }
    });
