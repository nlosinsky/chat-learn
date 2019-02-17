var socket = require('socket.io');
var async = require('async');
var sessionStore = require('libs/sessionStore');
var cookie = require('cookie');
var config = require('config');
var HttpError = require('error').HttpError;
var User = require('models').User;
var log = require('libs/log')(module);
var cookieParser = require('cookie-parser');

function loadSession(sid, callback) {

    // sessionStore callback is not quite async-style!
    sessionStore.load(sid, function(err, session) {
        if (arguments.length === 0) {
            // no arguments => no session
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });

}

function loadUser(session, callback) {

    if (!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return callback(null, null);
    }

    log.debug("retrieving user ", session.user);

    User.findById(session.user, function(err, user) {
        if (err) return callback(err);

        if (!user) {
            return callback(null, null);
        }
        log.debug("user findbyId result: " + user);
        callback(null, user);
    });

}

module.exports = function(server) {
    var io = socket(server, {
        origins: 'localhost:*',
        serveClient: false
    });

    io.use(function(socket, next) {
        var handshake = socket.handshake;

        async.waterfall([
            function(callback) {

                // сделать handshakeData.cookies - объектом с cookie
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:key')];
                var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

                loadSession(sid, callback);
            },
            function(session, callback) {
                if (!session) {
                    callback(new HttpError(401, "No session"));
                }

                handshake.session = session;
                loadUser(session, callback);
            },
            function(user, callback) {
                if (!user) {
                    callback(new HttpError(403, "Anonymous session may not connect"));
                }

                handshake.user = user;
                callback(null);
            }
        ], function(err) {
            if (!err) {
                return next();
            }

            next(err);
        });
    });

    io.on('session:reload', function(sid) {
        Object.values(io.sockets.clients().sockets).forEach(client => {
            if (client.handshake.session.id !== sid) return;

            loadSession(sid, function(err, session) {
                if (err) {
                    client.emit('error', 'server error');
                    client.disconnect();
                    return;
                }

                if (!session) {
                    // console.log(client);
                    client.emit('logout');
                    client.disconnect();
                    return;
                }

                client.handshake.session = session;
            });
        });
    });

    io.on('connection', function(socket){
        console.log('a user connected');

        var username = socket.handshake.user.get('username');

        socket.broadcast.emit('join', username);
        socket.on('message', function(text, cb) {
            console.log(username, text);
            socket.broadcast.emit('message', username, text);
            cb && cb();
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        })
    });

    return io;
};