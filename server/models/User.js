/**
 * Created by Rem on 19.08.2014.
 */
var mongoose = require('../utils/mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    config = require('../utils/config');

// Schemas
var User = new Schema({
    login      : {
        type     : String,
        match    : /^[\w\d -]{3,30}$/,
        required : true,
        unique   : true
    },
    password   : {
        type     : String,
        required : true
    },
    email      : {
        type   : String,
        unique : true
    },
    created_at : {type : Date},
    updated_at : {type : Date}
}, {
    versionKey : false,
    toJSON     : {transform : mongoose.defaultTransform}
});

User.statics.hash = User.hash = function(login, rawPass) {
    var hash = crypto.createHash('sha1');
    hash.update('' + login + config.get('auth:secret') + rawPass, 'utf8');

    return hash.digest('hex');
};

User.statics.findByLogin = function(login, cb) {
    this.findOne({login : login}, cb);
};

User.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }

    next();
});

module.exports = mongoose.model('User', User);