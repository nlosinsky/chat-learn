var express = require('express');
var router = express.Router();

router.route('/logout')
    .post(function(req, res, next) {
        var sid = req.session.id;
        var io = req.app.get('io');
        req.session.destroy(function(err) {
            io.sockets._events['session:reload'](sid);

            if (err) return next(err);

            res.redirect('/');
        });
    });

module.exports = router;