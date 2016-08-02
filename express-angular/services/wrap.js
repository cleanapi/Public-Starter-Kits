var WrapClient = require('wrap-api');
var _ = require('lodash');

var Wrap = function(apiKey) {
  this.client = new WrapClient(apiKey);
};

Wrap.prototype = _.extend(Wrap.prototype, {
  createPersonalizedWrap: function(wrapId, json, tags) {
    return this.client.wraps.createPersonalized(wrapId, {
      personalized_json: json,
      tags: tags
    });
  }
});

var wrapMiddleware = function(app, apiKey) {
  console.log(apiKey);
  var wrapInstance = new Wrap(apiKey);

  app.use(function (req, res, done) {
    req.wrap = wrapInstance;
    done();
  });
};

module.exports = wrapMiddleware;
