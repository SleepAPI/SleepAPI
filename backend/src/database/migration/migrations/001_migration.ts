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
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists(Tables.User);
}
