import { Tables } from '@src/database/migration/migrations/001_migration.js';
import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.string('recipe_type', 255).notNullable().defaultTo('curry');
    table.string('favored_berries', 255);
  });

  await knex.schema.alterTable(Tables.Pokemon, (table) => {
    table.string('gender', 6);
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.dropColumn('recipe_type');
    table.dropColumn('favored_berries');
  });

  await knex.schema.alterTable(Tables.Pokemon, (table) => {
    table.dropColumn('gender');
  });
}
