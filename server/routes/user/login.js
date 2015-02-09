/**
 * Created by Rem on 24.08.2014.
 */
var log = require('../../utils/log')(null, module),
    auth = require('../../services/auth'),
    Auth = require('../../models/Auth');

/**
 * Method: POST
 * URL: /user
 */
exports.submit = function(req, res, next) {
    var authData = auth.getCookieData(req.user),
        hash = Auth.hash(authData.key, authData.value),
        login = req.user.login;

    Auth.findOneAndUpdate(
        {login : login},
        {hash : hash, updated_at : Date.now()},
        function(err, authItem) {
            if (err) {
                log.error("Can't get Auth by login = %s. Error: %s", login, err.message);

                res.status(500);
                res.json({
                    success : false,
                    data    : 'Error: ' + err.message
                });
            } else if (!authItem) {
                // set Auth data
                authItem = new Auth({
                    hash  : hash,
                    login : login
                });

                authItem.save(function(err) {
                    if (err) {
                        if (err.name === 'ValidationError') {
                            var errMsg = err.message + ': ';
                            var errorsKeys = Object.keys(err.errors);
                            var errorsLength = errorsKeys.length;
                            for (var errorFieldInd = 0;
                                errorFieldInd < errorsLength;
                                ++errorFieldInd) {
                                errMsg += errorsKeys[errorFieldInd] + ' - '
                                          + err.errors[errorsKeys[errorFieldInd]].message;
                            }

                            log.debug("Auth validation error. %s", errMsg);

                            res.status(400);
                            res.json({
                                success : false,
                                data    : 'Error: ' + err.message
                            });
                        } else {
                            log.debug("Auth save error. Error: %s", err.message);

                            res.status(500);
                            res.json({
                                success : false,
                                data    : 'Error: ' + err.message
                            });
                        }
                    } else {
                        // set cookie
                        auth.setAuthCookie(req, res, authData);

                        res.json({
                            success : true
                        });
                    }
                });
            } else {
                // set cookie
                auth.setAuthCookie(req, res, authData);

                res.json({
                    success : true
                });
            }
        }
    );
};