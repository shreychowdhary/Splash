var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

var express = require('express');
var parser = require("body-parser");
//replace session with redis-store
var session = require("cookie-session");
var router = require("./src/routes");
var passport = require("passport");
var app = express();
require("./src/database");

app.use("/",express.static("public"));
app.use(parser.json());
app.use(session({
    name: 'session',
    keys: ["lville1810","shreyc"],
    maxAge: 60 * 60 * 1000
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(router);



app.listen(port,ip,function() {
    console.log('listening on '+ port);
});
