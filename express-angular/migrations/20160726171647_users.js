
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('username');
    table.string('first_name');
    table.string('last_name');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {

};
