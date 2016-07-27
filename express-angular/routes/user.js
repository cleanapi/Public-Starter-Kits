var express = require('express');
var User    = require('../models').User;
var router  = express.Router();
var _       = require('lodash');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

router.get('/', (req, res, done) => {
  User.fetchAll()
    .then(users => {
      res.json(users);
    })
    .catch(handleError(res));
});

router.get('/:id', (req, res, done) => {
  User.where('id', req.params.id)
    .fetch()
    .then(user => {
      if (user) {
        res.json(user);
      } else {
        res.json({});
      }
    })
    .catch(e => {
      res.status(404).json({
        error: 'The user does not exist'
      }).send(e);
    })
});

router.post('/', (req, res, done) => {
  User.forge(req.body).save()
  .then(u => {
    res.json(u);
  })
  .catch(handleError(res));
})

router.delete('/:id', (req, res, done) => {
  User.forge({
    id: req.params.id
  }).destroy()
    .then((user) => {
      res.json(user);
    })
    .catch(handleError(res));
});

router.put('/:id', (req, res, done) => {
  User.forge({
    id: req.params.id
  }).fetch()
    .then(user => {
      if (user) {
        user.save(_.merge(user.attributes, req.body))
          .then(user => {
            res.json(user)
          })
          .catch(handleError(res));
      } else {
        res.status(404).json({
          error: 'The user does not exist'
        })
      }
    })
    .catch(handleError(res));
})

module.exports = router;
