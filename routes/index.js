var express = require('express');
var router = express.Router();
var checkAuth = require('middleware/checkAuth');

router.use(require('./frontpage'));
router.use(require('./login'));
router.use(require('./logout'));
router.use(checkAuth, require('./chat'));
router.use(require('./users'));

module.exports = router;
