/**
 * Created by Rem on 24.08.2014.
 */
var passport = require('passport'),
    passportLocal = require('passport-local').Strategy,
    User = require('../models/User'),
    log = require('./log')(null, module);

module.exports = function() {
    passport.use(new passportLocal(
        {
            usernameField : 'login',
            passwordField : 'pass'
        },
        function(login, password, done) {
            var hash = User.hash(login, password);

            User.findOne({
                login    : login,
                password : hash
            }, function(err, user) {
                if (!user) {
                    if (err) {
                        log.error("Can't find user with login '%s' and hash '%s'", login, hash);

                        done(err);
                    } else {
                        log.debug("There is no user with login '%s'", login, {});

                        done(null, false, {message : 'Incorrect login and/or password'});
                    }
                } else {
                    done(null, user);
                }
            });
        }
    ));
};