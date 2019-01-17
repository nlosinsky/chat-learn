var crypto = require('crypto');
var async = require('async');
var util = require('util');
var mongoose = require('libs/mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, cb) {
  var User = this;

  async.waterfall([
        function(callback) {
          User.findOne({ username: username }, callback);
        },
        function(user, callback) {
          if (user) {
            if (user.checkPassword(password)) {
              callback(null, user);
            } else {
              cb(new AuthError("Пароль не верен"));
            }
          } else {
            var user = new User({ username: username, password: password });
            user.save(function(err) {
              if (err) return cb(err);
              callback(null, user);
            })
          }
        }
      ], cb);
};

module.exports.User = mongoose.model('User', schema);

// ошибки для выдачи посетителю
function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

module.exports.AuthError = AuthError;
