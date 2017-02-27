var mongoose = require("mongoose");

var users = new mongoose.Schema({
    code: Number,
    email: String,
    name: String,
    kills: Number,
    lastKillDate: String,
    alive: Boolean,
    next: String,
    admin: Boolean,
    sortIndex: Number
});

var model = mongoose.model("users", users);
module.exports = model;
