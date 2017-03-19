#!/usr/bin/env nodejs
var ip = "localhost";
var port = 8080;

var express = require('express');
var parser = require("body-parser");
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
app.use(function(req, res) {
    res.status(200).send('404: Page not Found', 404);
});


app.listen(port,ip,function() {
    console.log('listening on '+ port);
});
