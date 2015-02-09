/**
 * Created by Rem on 19.08.2014.
 */
var mongoose = require('../utils/mongoose'),
Schema       = mongoose.Schema,
crypto       = require('crypto'),
config       = require('../utils/config');

// Schemas
var Mp3 = new Schema({
    hash          : {
        type     : String,
        required : true,
        unique   : true
    },
    upload_count  : {type : Number},
    size          : {type : Number},
    contentOffset : {type : Number},
    contentLength : {type : Number},
    link          : {type : String},
    tags          : {
        type : Schema.Types.Mixed
    },
    created_at    : {type : Date},
    updated_at    : {type : Date}
}, {
    versionKey : false,
    toJSON     : {transform : mongoose.defaultTransform}
});

Mp3.statics.findByHash = function(hash, cb) {
    this.findOne({hash : hash}, cb);
};

Mp3.statics.findByHashAndSize = function(hash, size, cb) {
    this.findOne({
        hash : hash,
        size : size
    }, cb);
};

Mp3.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }

    next();
});

module.exports = mongoose.model('Mp3', Mp3);