class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

const notFound = (req, res, next) => {
    const err = new Error('Route Not Found');
    err.status = 404;
    next(err);
};

module.exports = ErrorHandler;
module.exports.notFound = notFound;
