var express = require('express'),
    http = require('http'),
    app = express(),
    middleware = require('./middleware')(app, express), // need to init middleware
    config = require('./utils/config'),
    log = require('./utils/log')(app, module);

var port = process.env.PORT || config.get('port');

http.createServer(app).listen(port, function () {
    log.info('Express server listening on port %d', port);
});