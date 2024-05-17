import { Knex } from 'knex';

export enum Tables {
  User = 'user',
  Token = 'token',
}

export async function up(knex: Knex) {
  await knex.schema.createTable(Tables.User, (table) => {
    table.increments('id');

    table.string('sub').notNullable().unique();
    table.uuid('external_id').notNullable().unique();
    table.string('name', 255);
  });

  await knex.schema.createTable(Tables.Token, (table) => {
    table.increments('id');

    table.uuid('device_id').notNullable().unique();
    table.string('refresh_token', 255).notNullable().unique();

    table.timestamp('last_login').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists(Tables.User);
  await knex.schema.dropTableIfExists(Tables.Token);
}
