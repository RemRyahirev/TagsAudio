/**
 * Created by Rem on 24.08.2014.
 */
var mongoose = require('../utils/mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

// Schemas
var Auth = new Schema({
    hash       : {
        type     : String,
        required : true
    },
    login      : {
        type     : String,
        required : true,
        unique   : true
    },
    created_at : {type : Date},
    updated_at : {type : Date}
}, {
    versionKey : false,
    toJSON     : {transform : mongoose.defaultTransform}
});

Auth.statics.hash = Auth.hash = function(cookieKey, cookieValue) {
    var hash = crypto.createHash('sha1');
    // TODO: maybe add a salt?
    hash.update('' + cookieKey + cookieValue, 'utf8');

    return hash.digest('hex');
};

Auth.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }

    next();
});

module.exports = mongoose.model('Auth', Auth);