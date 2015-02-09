var auth = require('../services/auth'),
    error = require('./error'),
    main = require('./main'),
    catalog = require('./catalog'),
    download = require('./download'),
    api = require('./api');

module.exports = function(router) {
    // ######### Site #########
    router.get('/', main.index);

    router.get('/catalog', catalog.index);
    router.get('/catalog/:artist', catalog.artist);
    router.get('/catalog/:artist/:album', catalog.album);
    router.get('/catalog/:artist/:album/:title', catalog.title);

    router.get('/download', download.index);

    // ######### API #########
    router.post('/api/get-tags', api.getTags);

    // Any other request to api is 405 Error
    router.use('/api/*', error(405, true));

    // ######### Any other request is 404 Error #########
    router.use('*', error(404));
};