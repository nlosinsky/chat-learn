const mongoose = require('libs/mongoose');
const async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function(err, results) {
    console.log(arguments);
    mongoose.disconnect(callback);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}
function dropDatabase(callback) {
    const db = mongoose.connection.db;

    db.dropDatabase(callback);
}

function requireModels(cb) {
    require('models');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, cb);
}

function createUsers(callback) {
    const users = [
        { username: 'Вася', password: 'vasya' },
        { username: 'Вася', password: 'petya' },
        { username: 'Админ', password: 'admin' }
    ];

    async.each(users, function(userData, callback) {
        const user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}
