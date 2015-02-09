/**
 * Created by Rem on 19.08.2014.
 */
var User = require('../models/User'),
    Auth = require('../models/Auth'),
    log = require('../utils/log')(null, module),
    passport = require('passport'),
    config = require('../utils/config'),
    crypto = require('crypto');

var getCookieKey = function(name, login) {
    var hash = crypto.createHash('sha1');
    hash.update('' + login + config.get('auth:cookie:keySecret'), 'utf8');
    return name + '[' + hash.digest('hex') + ']';
};

var getCookieValue = function(pass) {
    var hash = crypto.createHash('sha1');
    hash.update('' + pass + config.get('auth:cookie:valueSecret'), 'utf8');
    return hash.digest('hex');
};

exports.validateCookies = function(req, res, next) {
    // looking for existing cookies
    var cookieName = config.get('auth:cookie:name'),
        cookieTtl = config.get('auth:cookie:ttl'),
        authCookies = {};
    for (var cookieKey in req.cookies) {
        if (!req.cookies.hasOwnProperty(cookieKey)) {
            continue;
        }

        if (cookieKey.substr(0, cookieName.length + 1) === cookieName + '['
            && cookieKey.substr(-1, 1) === ']') {
            authCookies[Auth.hash(
                cookieKey, //.substr(cookieName.length + 1).substr(0, -1),
                req.cookies[cookieKey]
            )] = {
                key   : cookieKey,
                value : req.cookies[cookieKey]
            };
        }
    }
    var criteriaArr = Object.keys(authCookies);

    if (criteriaArr.length) {
        // try to find existing cookies in db auth data
        Auth.find({hash : {$in : criteriaArr}}, function(err, auths) {
            var found = false;
            if (err) {
                log.error('Error in finding existing cookies in Auth schema');
            } else {
                for (var authKey = 0; authKey < auths.length; authKey++) {
                    var auth = auths[authKey];

                    if (getCookieKey(cookieName, auth.login) === authCookies[auth.hash].key
                        && Date.now() < new Date(auth.updated_at).getTime() + (cookieTtl * 1000)) {

                        found = true;
                        User.findOne({login : auth.login}, function(err, user) {
                            if (err) {
                                log.error("Can't found User with login %s", auth.login, {});
                            }
                            if (user) {
                                req.user = user;
                            }
                            next();
                        });
                        break;
                    }
                }
            }

            if (!found) {
                next();
            }
        });
    } else {
        next();
    }
};

exports.required = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        passport.authenticate(
            'local',
            function(err, user, info) {
                if (err) {
                    res.status(500);
                    res.json({
                        success : false,
                        data    : 'Server authentication error'
                    });
                } else if (!user) {
                    res.status(403);
                    res.json({
                        success : false,
                        data    : 'Authentication required: ' + info.message
                    });
                } else {
                    next();
                }
            }
        )(req, res, next);
    }
};

var getCookieData = function(user) {
    var conf = config.get('auth:cookie');

    return {
        name     : conf.name,
        key      : getCookieKey(conf.name, user.login),
        value    : getCookieValue(user.password),
        domain   : conf.domain,
        maxAge   : conf.ttl * 1000,
        secure   : conf.secure,
        httpOnly : conf.httpOnly
    };
};
exports.getCookieData = getCookieData;

exports.setAuthCookie = function(req, res, data) {
    //var data = getCookieData(user);
    // if not found existing cookie
    if (!req.cookies || !req.cookies[data.key] || req.cookies[data.key] !== data.value) {
        // clear old auth cookies
        for (var cookieKey in req.cookies) {
            if (!req.cookies.hasOwnProperty(cookieKey)) {
                continue;
            }

            // if our auth cookie
            var cookie = req.cookies[cookieKey];
            if (cookieKey.substr(0, data.name.length + 1) === data.name + '['
                && cookieKey.substr(-1, 1) === ']'
                && cookie.path === '/') {
                res.clearCookie(cookieKey, {path : '/'});
            }
        }
    }

    // set new one auth cookie or update existing
    res.cookie(data.key, data.value, {
        domain   : data.domain,
        path     : '/',
        secure   : data.secure,
        httpOnly : data.httpOnly,
        maxAge   : data.maxAge
    });
};