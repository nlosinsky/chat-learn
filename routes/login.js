var async = require('async');
var express = require('express');
var router = express.Router();
var { User, AuthError } = require('models');
var HttpError = require('error').HttpError;

router.route('/login')
    .get(function(req, res, next) {
        res.render('login');
    })
    .post(function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;

        User.authorize(username, password, function(err, user) {
            if (err) {
                if (err instanceof AuthError) {
                    return next(new HttpError(403, err.message));
                }
                return next(err)
            }

            req.session.user = user._id;

            res.end();
        });
    });

module.exports = router;
