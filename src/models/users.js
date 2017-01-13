var mongoose = require("mongoose");

var users = new mongoose.Schema({
    id: String,
    code: Number,
    email: String,
    name: String,
    kills: Number,
    lastKillDate: Date,
    alive: Boolean,
    next: String,
    admin: Boolean
});

var model = mongoose.model("users", users);
module.exports = model;
