const logger = require('../utils/logger');
const geoip = require('geoip-lite');

const loggerMiddleware = (req, res, next) => {
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        res.end = originalEnd
        // Get IP and geo info
        const ip = req.ip || req.connection.remoteAddress;
        const geo = geoip.lookup(ip);
        // Create fingerprint object
        const fingerprint = {
            ip,
            userAgent: req.headers['user-agent'],
            location: geo ? {
                country: geo.country,
                region: geo.region,
                city: geo.city
            } : null,
            method: req.method,
            url: req.originalUrl,
            referer: req.headers.referer || '',
            timestamp: new Date().toISOString(),
            user: req.user ? {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role
            } : null,
            statusCode: res.statusCode,
            responseTime: Date.now() - req._startTime
        };

        // Log the request with fingerprint
        logger.info({
            type: 'request',
            msg: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
            fingerprint
        });

        // Call the original end function
        return originalEnd.call(this, chunk, encoding);
    };

    // Set start time
    req._startTime = Date.now();
    next();
};

module.exports = loggerMiddleware; 