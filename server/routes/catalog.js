var Mp3 = require('../models/Mp3'),
    log = require('../utils/log')(null, module);

/**
 * Method: GET
 * URL: /catalog
 */
exports.index = function(req, res, next) {
    Mp3.find({}, function(err, mp3s) {
        if (err) {
            log.debug("Mp3 find all error. %s", err.message);
            mp3s = [];
        }

        var list = mp3s.map(function(item) {
            return {
                name: item.tags.artist,
                url: '/catalog/' + encodeURIComponent(item.tags.artist)
            };
        });

        res.render('catalog', {
            urls : {
                home     : '/',
                catalog  : '/catalog',
                download : '/download'
            },
            title: 'Artists',
            list: list
        });
    });
};

/**
 * Method: GET
 * URL: /catalog/:artist
 */
exports.artist = function(req, res, next) {
    var artist = req.params.artist;

    Mp3.find({"tags.artist" : artist}, function(err, mp3s) {
        if (err) {
            log.debug("Mp3 find by artist error. %s", err.message);
            mp3s = [];
        }

        var list = mp3s.map(function(item) {
            return {
                name: item.tags.album,
                url: '/catalog/' + encodeURIComponent(artist) + '/' + encodeURIComponent(item.tags.album)
            };
        });

        res.render('catalog', {
            urls : {
                home     : '/',
                catalog  : '/catalog',
                download : '/download'
            },
            title: artist + ' - Albums',
            list: list
        });
    });
};

/**
 * Method: GET
 * URL: /catalog/:artist/:album
 */
exports.album = function(req, res, next) {
    var artist = req.params.artist;
    var album = req.params.album;

    Mp3.find({"tags.artist" : artist, "tags.album" : album}, function(err, mp3s) {
        if (err) {
            log.debug("Mp3 find by album error. %s", err.message);
            mp3s = [];
        }

        var list = mp3s.map(function(item) {
            return {
                name: item.tags.title,
                url: '/catalog/' + encodeURIComponent(artist) + '/' + encodeURIComponent(item.tags.album) + '/' + encodeURIComponent(item.tags.title)
            };
        });

        res.render('catalog', {
            urls : {
                home     : '/',
                catalog  : '/catalog',
                download : '/download'
            },
            title: artist + ' - ' + album + ' - Tracks',
            list: list
        });
    });
};

/**
 * Method: GET
 * URL: /catalog/:artist/:album/:title
 */
exports.title = function(req, res, next) {
    var artist = req.params.artist;
    var album = req.params.album;
    var title = req.params.title;

    Mp3.findOne({"tags.artist" : artist, "tags.album" : album, "tags.title" : title}, function(err, file) {
        if (err) {
            log.debug("Mp3 find by title error. %s", err.message);
            file = {};
        }

        res.render('catalog_file', {
            urls : {
                home     : '/',
                catalog  : '/catalog',
                download : '/download'
            },
            file: file
        });
    });
};