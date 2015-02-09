var config = require('../utils/config');

var sendHttpError = function (error, req, res) {
    res.status(error.status);

    if (req.xhr) {
        res.json({success: false, data: error.name + ': ' + error.message});
    } else {
        res.render('server/error', {
            error: {
                status:  error.status,
                message: error.message,
                stack:   config.get('debug') ? error.stack : ''
            }
        });
    }
};

module.exports = function (app, express) {
    var log = require('../utils/log')(app, module),
        HttpError = require('../routes/error').HttpError;

    return function (err, req, res, next) {
        if (typeof err === 'number') {
            err = new HttpError(err);
        }
        if (err instanceof Error) {
            sendHttpError(err, req, res);
        } else {
            if (app.get('env') === 'development') {
                express.errorHandler()(err, req, res, next);
            } else {
                log.error(err);
                err = new HttpError(500);
                sendHttpError(err, req, res);
            }
        }
    };
};