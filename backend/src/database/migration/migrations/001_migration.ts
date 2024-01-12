import { Knex } from 'knex';

export enum Tables {
  PokemonCombination = 'pokemon_combination',
  PokemonCombination30 = 'pokemon_combination30',
  PokemonCombinationForMeal = 'pokemon_combination_for_meal',
  PokemonCombinationForMeal30 = 'pokemon_combination_for_meal30',

  BuddyCombination = 'buddy_combination',
  BuddyCombination30 = 'buddy_combination30',
  BuddyCombinationForMeal = 'buddy_combination_for_meal',
  BuddyCombinationForMeal30 = 'buddy_combination_for_meal30',
}

export async function up(knex: Knex) {
  await knex.schema.createTable(Tables.PokemonCombination, (table) => {
    table.increments('id');

    table.string('pokemon', 255).index().notNullable();
    table.string('berry', 255).index().notNullable();

    table.string('ingredient0', 255).notNullable();
    table.integer('amount0').notNullable();
    table.decimal('produced_amount0').notNullable();

    table.string('ingredient30', 255).notNullable();
    table.integer('amount30').notNullable();
    table.decimal('produced_amount30').notNullable();

    table.string('ingredient60', 255).notNullable();
    table.integer('amount60').notNullable();
    table.decimal('produced_amount60').notNullable();
  });

  await knex.schema.createTable(Tables.PokemonCombination30, (table) => {
    table.increments('id');

    table.string('pokemon', 255).index().notNullable();
    table.string('berry', 255).index().notNullable();

    table.string('ingredient0', 255).notNullable();
    table.integer('amount0').notNullable();
    table.decimal('produced_amount0').notNullable();

    table.string('ingredient30', 255).notNullable();
    table.integer('amount30').notNullable();
    table.decimal('produced_amount30').notNullable();
  });

  await knex.schema.createTable(Tables.PokemonCombinationForMeal, (table) => {
    table.increments('id');

    table
      .integer(`fk_${Tables.PokemonCombination}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.PokemonCombination);
    table.string('meal', 255).index().notNullable();

    table.decimal('percentage').index().notNullable();
    table.decimal('contributed_power').index().notNullable();
  });

  await knex.schema.createTable(Tables.PokemonCombinationForMeal30, (table) => {
    table.increments('id');

    table
      .integer(`fk_${Tables.PokemonCombination}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.PokemonCombination);
    table.string('meal', 255).index().notNullable();

    table.decimal('percentage').index().notNullable();
    table.decimal('contributed_power').index().notNullable();
  });

  await knex.schema.createTable(Tables.BuddyCombination, (table) => {
    table.increments('id');

    table
      .integer(`fk_${Tables.PokemonCombination}_id1`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.PokemonCombination);
    table
      .integer(`fk_${Tables.PokemonCombination}_id2`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.PokemonCombination);

    table.string('produced', 255).index().notNullable();
  });

  await knex.schema.createTable(Tables.BuddyCombination30, (table) => {
    table.increments('id');

    table
      .integer(`fk_${Tables.PokemonCombination30}_id1`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.PokemonCombination30);
    table
      .integer(`fk_${Tables.PokemonCombination30}_id2`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.PokemonCombination30);

    table.string('produced', 255).index().notNullable();
  });

  await knex.schema.createTable(Tables.BuddyCombinationForMeal, (table) => {
    table.increments('id');

    table
      .integer(`fk_${Tables.BuddyCombination}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.BuddyCombination);
    table.string('meal', 255).index().notNullable();

    table.decimal('percentage').index().notNullable();
    table.decimal('contributed_power').index().notNullable();
  });

  await knex.schema.createTable(Tables.BuddyCombinationForMeal30, (table) => {
    table.increments('id');

    table
      .integer(`fk_${Tables.BuddyCombination30}_id`)
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(Tables.BuddyCombination30);
    table.string('meal', 255).index().notNullable();

    table.decimal('percentage').index().notNullable();
    table.decimal('contributed_power').index().notNullable();
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists(Tables.BuddyCombinationForMeal);
  await knex.schema.dropTableIfExists(Tables.BuddyCombinationForMeal30);
  await knex.schema.dropTableIfExists(Tables.BuddyCombination);
  await knex.schema.dropTableIfExists(Tables.BuddyCombination30);

  await knex.schema.dropTableIfExists(Tables.PokemonCombinationForMeal);
  await knex.schema.dropTableIfExists(Tables.PokemonCombinationForMeal30);
  await knex.schema.dropTableIfExists(Tables.PokemonCombination);
  await knex.schema.dropTableIfExists(Tables.PokemonCombination30);
}
