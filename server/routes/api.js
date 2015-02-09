var Mp3 = require('../models/Mp3'),
    log = require('../utils/log')(null, module);

/**
 * Method: POST
 * URL: /api/get-tags
 */
exports.getTags = function(req, res, next) {
    if (!req.body || !req.body.hash || !req.body.size) {
        res.status(400);
        res.json({
            success : false,
            data    : 'No hash and/or size specified'
        });
        return;
    }

    Mp3.findByHashAndSize(req.body.hash, req.body.size, function(error, mp3) {
        if (!mp3) {
            mp3 = new Mp3(req.body);
            mp3.upload_count = 1;

            mp3.save(function(err) {
                if (err) {
                    if (err.name === 'ValidationError') {
                        var errMsg = err.message + ': ';
                        var errorsKeys = Object.keys(err.errors);
                        var errorsLength = errorsKeys.length;
                        for (var errorFieldInd = 0; errorFieldInd < errorsLength; ++errorFieldInd) {
                            errMsg += errorsKeys[errorFieldInd] + ' - '
                                      + err.errors[errorsKeys[errorFieldInd]].message;
                        }

                        log.debug("Mp3 validation error. %s", errMsg);

                        res.status(400);
                        res.json({
                            success : false,
                            data    : 'Error: ' + err.message
                        });
                    } else {
                        log.debug("Mp3 save error. Error: %s", err.message);

                        res.status(500);
                        res.json({
                            success : false,
                            data    : 'Error: ' + err.message
                        });
                    }
                } else {
                    log.info("Created new Mp3 = %j", mp3, {});

                    res.json({
                        success : true,
                        data    : mp3.toJSON()
                    });
                }
            });
        } else {
            mp3.upload_count++;
            mp3.save(function(err) {
                if (err) {
                    log.debug("Mp3 update error. Error: %s", err.message);
                }
            });

            res.json({
                success : true,
                data    : mp3.toJSON()
            });
        }
    });
};