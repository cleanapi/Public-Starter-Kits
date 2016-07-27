var services = require('../services');
var checkit  = require('checkit');

var User = services.bookshelf.Model.extend({
  tableName: 'users',
  initialize: function(attrs, opts) {
    this.on('saving', this.validateSave);
  },
  hasTimestamps: true,
  validateSave: function() {
    return new checkit({
      username: 'required'
    }).run(this.attributes);
  }
});

module.exports = User;
