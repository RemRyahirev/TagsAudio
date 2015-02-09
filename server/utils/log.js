var winston = require('winston');

var config = require('./config');

function getLogger(app, module) {
    var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true,
                level:    process.env.DEBUG_LEVEL || config.get('log:level'),
                label:    path
            })
        ]
    });
}

module.exports = getLogger;