import { Knex } from 'knex';

export enum Tables {
  User = 'user',
  UserSettings = 'user_settings',

  Pokemon = 'pokemon',

  Team = 'team',
  TeamMember = 'team_member',
}

export async function up(knex: Knex) {
  await knex.schema.createTable(Tables.User, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table.string('sub').notNullable().unique();
    table.uuid('external_id').notNullable().unique();
    table.string('name', 255).notNullable().defaultTo('New user');
    table.string('avatar', 255);
  });

  await knex.schema.createTable(Tables.UserSettings, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table.string('bedtime').defaultTo('21:30');
    table.string('wakeup').defaultTo('06:00');
  });

  await knex.schema.createTable(Tables.Pokemon, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table
      .integer(`fk_${Tables.User}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.User)
      .onDelete('CASCADE');

    table.boolean('saved').index().defaultTo(false);

    // TODO: need to trigger production migration
    table.string('pokemon', 255).notNullable();
    table.string('name', 255).notNullable();
    table.integer('skill_level').notNullable();
    table.integer('carry_size').notNullable();
    table.integer('level').notNullable();
    table.string('nature', 255).notNullable();

    table.string('subskill_10', 255);
    table.string('subskill_25', 255);
    table.string('subskill_50', 255);
    table.string('subskill_75', 255);
    table.string('subskill_100', 255);

    table.string('ingredient_0', 255).notNullable();
    table.string('ingredient_30', 255).notNullable();
    table.string('ingredient_60', 255).notNullable();
  });

  await knex.schema.createTable(Tables.Team, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table
      .integer(`fk_${Tables.User}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.User)
      .onDelete('CASCADE');

    table.integer('team_index').notNullable().index();
    table.string('name', 255).notNullable();

    table.boolean('camp').defaultTo(false);

    table.unique([`fk_${Tables.User}_id`, 'team_index']);
  });

  await knex.schema.createTable(Tables.TeamMember, (table) => {
    table.increments('id');
    table.integer('version').defaultTo(1);

    table
      .integer(`fk_${Tables.Team}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.Team)
      .onDelete('CASCADE');
    table
      .integer(`fk_${Tables.Pokemon}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.Pokemon)
      .onDelete('CASCADE');

    table.integer('member_index').notNullable().index();

    table.unique([`fk_${Tables.Team}_id`, 'member_index']);
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists(Tables.TeamMember);
  await knex.schema.dropTableIfExists(Tables.Team);
  await knex.schema.dropTableIfExists(Tables.Pokemon);
  await knex.schema.dropTableIfExists(Tables.UserSettings);
  await knex.schema.dropTableIfExists(Tables.User);
}
