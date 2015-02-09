module.exports = function(app, express) {
    var path = require('path'),
        favicon = require('serve-favicon'),
        morgan = require('morgan'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        jade = require('jade'),
        routes = require('../routes'),
        errorHandler = require('./errorHandler')(app, express),
        config = require('../utils/config'),
        passportInit = require('../utils/passport')(), // imported for init
        passport = require('passport'),
        seeder = require('../services/seeder'),
        auth = require('../services/auth');

    // Page Rendering
    app.set('view', require('express-prefixed-roots-view'));
    app.set('views', {
        ''       : path.join(__dirname, '../../client/templates/'),
        'server' : path.join(__dirname, '../views/')
    });
    app.locals.basedir = path.join(__dirname, '../../');
    app.set('view engine', 'jade');

    // Favicon
    app.use(favicon('favicon.ico'));

    // Logger
    if (app.get('env') === 'development') {
        app.use(morgan('dev'));
    }

    app.use(cookieParser());
    app.use(bodyParser.json());

    // Static directory
    app.use(express.static(path.join(__dirname, '../../static'),
        {maxAge : config.get('cache:maxAge')}));
    app.use('/static', express.static(path.join(__dirname, '../../static'),
        {maxAge : config.get('cache:maxAge')}));
    app.use('/client', express.static(path.join(__dirname, '../../client'),
        {maxAge : config.get('cache:maxAge')}));

    // seeder
    app.use(seeder.initSeeder);

    // Auth middleware
    app.use(passport.initialize());
    app.use(auth.validateCookies);

    // dev auto admin auth
    if (app.get('env') === 'development') {
        var User = require('../models/User');
        app.use(function(req, res, next) {
            if (!req.user) {
                User.findOne({login : 'admin'}, function(err, user) {
                    if (user) {
                        req.user = user;
                    }
                    next();
                });
            } else {
                next();
            }
        });
    }

    // Routing
    var router = express.Router();
    routes(router);
    app.use(router);

    // Error handing
    app.use(errorHandler);
};