module.exports = function (code, isJson) {
    if (typeof isJson === 'undefined') {
        isJson = false;
    }

    switch (code) {
        case 404:
            return function (req, res, next) {
                res.status(code);
                res.render('server/404');
            };
            break;
        case 405:
            if (isJson) {
                return function (req, res, next) {
                    res.status(code);
                    res.json({success: false, data: 'Method not allowed'});
                };
            } else {
                return function (req, res, next) {
                    res.status(code);
                    res.render('server/error');
                };
            }
            break;
        default:
            return function (req, res, next) {
                res.status(code);
                res.render('server/error');
            };
            break;
    }
};