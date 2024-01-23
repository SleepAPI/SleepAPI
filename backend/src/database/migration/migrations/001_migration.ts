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
  return knex;
}

// TODO: need to run this once
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
