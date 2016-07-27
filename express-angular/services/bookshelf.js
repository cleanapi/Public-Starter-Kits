require('dotenv').config({silent: true});

var knex = require('knex')({
  client: 'postgres',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: 'utf-8',
  }
});

var bookshelf = module.exports = require('bookshelf')(knex);
