Throttle = require('./models/throttle');

module.exports = function(request, response, next) {
    'use strict';
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;

    // this check is necessary for some clients that set an array of IP addresses
    ip = (ip || '').split(',')[0];

    Throttle.findOneAndUpdate({ip: ip},
        { $inc: { hits: 1 } },
        { upsert: false }, function(error, throttle) {
            if (error) {
                response.statusCode = 500;
                return next(error);
            }
            else if (!throttle) {
                Throttle.create({createdAt:new Date(), ip:ip},function(error, throttle) {
                    if (error) {
                        response.statusCode = 500;
                        return next(error);
                    }
                    else if (!throttle) {
                        response.statusCode = 500;
                        return response.json({message: 'Error checking rate limit'});
                    }

                    respondWithThrottle(request, response, next, throttle);
                });
            }
            else {
                respondWithThrottle(request, response, next, throttle);
            }
        });

    function respondWithThrottle(request, response, next, throttle) {
        var timeUntilReset = (3 * 60 * 1000) -
                    (new Date().getTime() - throttle.createdAt.getTime()),
            remaining =  Math.max(0, (3 - throttle.hits));

        response.set('X-Rate-Limit-Limit', 3);
        response.set('X-Rate-Limit-Remaining', remaining);
        response.set('X-Rate-Limit-Reset', timeUntilReset);
        request.throttle = throttle;
        if (throttle.hits < 3) {
            return next();
        } else {
            return response.status(429).json({message: 'Too many tries, try again in 3 minutes'});
        }
    }
};
