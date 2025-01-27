const logger = require('../utils/logger');
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log detailed error information
    logger.error({
        message: err.message,
        statusCode: err.statusCode,
        stack:'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        requestId: req.id,
        userId: req.user?.id
    });

    // Development error response
    if (process.env.NODE_ENV === 'development') {
        logger.debug('Sending detailed error response for development');
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    // Production error response
    else {
        if (err.isOperational) {

            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {

            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!',
            });
        }
    }
};
module.exports = { AppError, errorHandler };
