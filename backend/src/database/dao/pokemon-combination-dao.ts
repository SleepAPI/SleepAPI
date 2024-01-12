import { Static, Type } from '@sinclair/typebox';
import { OPTIMAL_POKEDEX } from '../../domain/pokemon/pokemon';
import { RASH } from '../../domain/stat/nature';
import { HELPING_SPEED_M, INGREDIENT_FINDER_M, INVENTORY_L } from '../../domain/stat/subskill';
import {
  calculateProducePerMealWindow,
  getAllIngredientCombinationsForLevel,
} from '../../services/calculator/ingredient/ingredient-calculate';
import { AbstractDAO, DBWithIdSchema } from './abstract-dao';

const DBPokemonCombinationSchema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    pokemon: Type.String(),
    berry: Type.String(),

    ingredient0: Type.String(),
    amount0: Type.Number(),
    produced_amount0: Type.Number(),

    ingredient30: Type.String(),
    amount30: Type.Number(),
    produced_amount30: Type.Number(),

    ingredient60: Type.String(),
    amount60: Type.Number(),
    produced_amount60: Type.Number(),
  }),
]);
export type DBPokemonCombination = Static<typeof DBPokemonCombinationSchema>;

class PokemonCombinationDAOImpl extends AbstractDAO<typeof DBPokemonCombinationSchema> {
  public tableName = 'pokemon_combination';
  public schema = DBPokemonCombinationSchema;

  public async seed(): Promise<void> {
    const result = await this.findMultiple();
    if (result.length > 0) {
      return;
    }

    const pokemonCombinations = [];
    for (const pokemon of OPTIMAL_POKEDEX) {
      for (const combination of getAllIngredientCombinationsForLevel(pokemon, 60)) {
        const [ingredientDrop0, ingredientDrop30, ingredientDrop60] = combination;
        const [producedIngredient0, producedIngredient30, producedIngredient60] = calculateProducePerMealWindow({
          pokemonCombination: {
            pokemon: pokemon,
            ingredientList: combination,
          },
          customStats: { level: 60, nature: RASH, subskills: [INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L] },
        }).produce.ingredients;

        const ingredient0 = ingredientDrop0.ingredient.name;
        const amount0 = ingredientDrop0.amount;
        const produced_amount0 = producedIngredient0.amount;

        const ingredient30 = ingredientDrop30.ingredient.name;
        const amount30 = ingredientDrop30.amount;
        const produced_amount30 = producedIngredient30.amount;

        const ingredient60 = ingredientDrop60.ingredient.name;
        const amount60 = ingredientDrop60.amount;
        const produced_amount60 = producedIngredient60.amount;

        pokemonCombinations.push({
          pokemon: pokemon.name,
          berry: pokemon.berry.name,
          ingredient0,
          amount0,
          produced_amount0,
          ingredient30,
          amount30,
          produced_amount30,
          ingredient60,
          amount60,
          produced_amount60,
        });
      }
    }

    return await this.batchInsert(pokemonCombinations);
  }

  public producedAfter6H(pokemonCombination: DBPokemonCombination): { amount: number; ingredient: { name: string } }[] {
    const produced0 = {
      amount: pokemonCombination.produced_amount0,
      ingredient: { name: pokemonCombination.ingredient0 },
    };
    const produced30 = {
      amount: pokemonCombination.produced_amount30,
      ingredient: { name: pokemonCombination.ingredient30 },
    };
    const produced60 = {
      amount: pokemonCombination.produced_amount60,
      ingredient: { name: pokemonCombination.ingredient60 },
    };

    return [produced0, produced30, produced60];
  }
}

export const PokemonCombinationDAO = new PokemonCombinationDAOImpl();
