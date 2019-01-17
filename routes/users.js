var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var User = require('models').User;
var HttpError = require('error').HttpError;

/* GET users listing. */
router.get('/users', function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) return next(err);

    res.json(users);
  });
});

router.get('/user/:id', function(req, res, next) {
  try {
    new ObjectID(req.params.id);
  } catch(e) {
    return next(404);
  }
  User.findById(req.params.id, function(err, user) {
    if (err) return next(err);

    if (!user) {
      return next(new HttpError(404, 'User not found'));
    }

    res.json(user);
  });
});

module.exports = router;
