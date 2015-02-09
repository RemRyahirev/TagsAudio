/**
 * Method: GET
 * URL: /
 */
exports.index = function(req, res, next) {
    res.render('index', {
        urls : {
            home     : '/',
            catalog  : '/catalog',
            download : '/download'
        }
    });
};