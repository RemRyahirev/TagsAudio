var fs = require('fs'),
    path = require('path'),
    dateFormat = require('dateformat');;

/**
 * Method: GET
 * URL: /download
 */
exports.index = function(req, res, next) {
    var files_path = path.resolve(__dirname, '../../static/files');
    fs.readdir(files_path, function(err, files) {
        if (err) {
            files = [];
        }

        var list = files.map(function(file) {
            var stat = fs.statSync(path.join(files_path, file));

            return {
                path: '/files/' + file,
                name: file,
                size: parseInt(stat.size / 1024 / 1024),
                date: dateFormat(stat.mtime, "yyyy-mm-dd'<br>'HH:MM:ss'<br>'('GMT' o)")
            }
        });

        res.render('download', {
            urls : {
                home     : '/',
                catalog  : '/catalog',
                download : '/download'
            },
            list: list
        });
    });
};