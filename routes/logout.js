var express = require('express');
var router = express.Router();

router.route('/logout')
    .post(function(req, res, next) {
        req.session.destroy();
        res.redirect('/');
    });

module.exports = router;