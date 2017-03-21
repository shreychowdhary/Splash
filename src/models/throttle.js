/**
 * A rate-limiting Throttle record, by IP address
 * models/throttle.js
 */
var mongoose = require('mongoose');

var throttle = new mongoose.Schema({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 60 * 3 // (60 * 2), 2 minutes
    },
    ip: {
        type: String,
        required: true,
        trim: true,
        match: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    },
    hits: {
        type: Number,
        default: 1,
        required: true,
        max: 3,
        min: 0
    }
});

throttle.index({ createdAt: 1  }, { expireAfterSeconds: 60 * 3 });
module.exports = mongoose.model('throttle', throttle);
