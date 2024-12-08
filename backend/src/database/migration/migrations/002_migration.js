import { Tables } from './001_migration.js';

export async function up(knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.string('recipe_type', 255).notNullable().defaultTo('curry');
    table.string('favored_berries', 255);
  });

  await knex.schema.alterTable(Tables.Pokemon, (table) => {
    table.string('gender', 6);
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.dropColumn('recipe_type');
    table.dropColumn('favored_berries');
  });

  await knex.schema.alterTable(Tables.Pokemon, (table) => {
    table.dropColumn('gender');
  });
}
