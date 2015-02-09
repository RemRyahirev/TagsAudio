/**
 * Created by Rem on 24.08.2014.
 */
var log = require('../utils/log')(null, module),
    config = require('../utils/config'),
    User = require('../models/User');

exports.initSeeder = function(req, res, next) {
    if (config.get('runtime:initSeeder') === true) {
        next();
        return;
    }

    config.set('runtime:initSeeder', true);

    exports.seeder(
        User,
        'login',
        [
            {
                login    : 'admin',
                password : User.hash('admin', 'qwe123'),
                email    : 'admin@widgetty.net'
            },
            {
                login    : 'demo',
                password : User.hash('demo', 'demo'),
                email    : 'demo@wigetty.net'
            }
        ],
        function() {

        }
    );
};

exports.seeder = function(model, field, data, cb) {
    if (!data.length) {
        cb();
        return;
    }

    // TODO: добавить поддержку уникальности по нескольким полям
    var fields = [];
    for (var itemKey = 0; itemKey < data.length; itemKey++) {
        var item = data[itemKey];

        fields.push(item[field]);
    }

    if (!fields.length) {
        cb();
        return;
    }

    var searchCondition = {};
    searchCondition[field] = {$in : fields};
    model.find(searchCondition, function(err, items) {
        var existingFields = [];
        for (var itemKey = 0; itemKey < items.length; itemKey++) {
            var item = items[itemKey];

            existingFields.push(item[field]);
        }

        var saveArr = [];
        for (var newItemKey = 0; newItemKey < data.length; newItemKey++) {
            var newItem = data[newItemKey];

            if (existingFields.indexOf(newItem[field]) !== -1) {
                continue;
            }

            saveArr.push(newItem);
        }

        if (!saveArr.length) {
            cb();
            return;
        }

        model.create(saveArr, function(err) {
            if (err) {
                log.error('Seeder error: %s', err, {});
            }
            cb();
        });
    });
};
