var services = require('../services');
var User     = require('./user');

class UserCollection extends services.bookshelf.Collection {
  get model() {
    return User;
  }
}

module.exports = UserCollection;
