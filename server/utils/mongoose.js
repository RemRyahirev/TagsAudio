var mongoose = require('mongoose');

var config = require('./config');
var log = require('./log')(null, module);

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || config.get('mongodb:uri'));
var db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback() {
    log.info('Connected to DB!');
});

// Standard function to get better output for a model
mongoose.defaultTransform = function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
};

module.exports = mongoose;