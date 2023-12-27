import { Static, Type } from '@sinclair/typebox';
import { POKEDEX } from '../../domain/pokemon/pokemon';
import { RASH } from '../../domain/stat/nature';
import { HELPING_SPEED_M, INGREDIENT_FINDER_M, INVENTORY_L, SubSkill } from '../../domain/stat/subskill';
import {
  calculateProducePerMealWindow,
  getAllIngredientCombinationsForLevel,
} from '../../services/calculator/ingredient/ingredient-calculate';
import { AbstractDAO, DBWithIdSchema } from './abstract-dao';

const DBPokemonCombination30Schema = Type.Composite([
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
  }),
]);
export type DBPokemonCombination30 = Static<typeof DBPokemonCombination30Schema>;

class PokemonCombination30DAOImpl extends AbstractDAO<typeof DBPokemonCombination30Schema> {
  public tableName = 'pokemon_combination30';
  public schema = DBPokemonCombination30Schema;

  public async seed(): Promise<void> {
    const result = await this.findMultiple();
    if (result.length > 0) {
      return;
    }

    const pokemonCombinations = [];
    for (const pokemon of POKEDEX) {
      for (const combination of getAllIngredientCombinationsForLevel(pokemon, 30)) {
        const [ingredientDrop0, ingredientDrop30] = combination;
        const subskills: SubSkill[] =
          pokemon.maxCarrySize > pokemon.carrySize
            ? [INGREDIENT_FINDER_M, HELPING_SPEED_M]
            : [INGREDIENT_FINDER_M, INVENTORY_L];
        const [producedIngredient0, producedIngredient30] = calculateProducePerMealWindow({
          pokemonCombination: {
            pokemon: pokemon,
            ingredientList: combination,
          },
          customStats: { level: 30, nature: RASH, subskills },
        }).produce.ingredients;

        const ingredient0 = ingredientDrop0.ingredient.name;
        const amount0 = ingredientDrop0.amount;
        const produced_amount0 = producedIngredient0.amount;

        const ingredient30 = ingredientDrop30.ingredient.name;
        const amount30 = ingredientDrop30.amount;
        const produced_amount30 = producedIngredient30.amount;

        pokemonCombinations.push({
          pokemon: pokemon.name,
          berry: pokemon.berry.name,
          ingredient0,
          amount0,
          produced_amount0,
          ingredient30,
          amount30,
          produced_amount30,
        });
      }
    }

    return await this.batchInsert(pokemonCombinations);
  }

  public producedAfter6H(
    pokemonCombination: DBPokemonCombination30
  ): { amount: number; ingredient: { name: string } }[] {
    const produced0 = {
      amount: pokemonCombination.produced_amount0,
      ingredient: { name: pokemonCombination.ingredient0 },
    };
    const produced30 = {
      amount: pokemonCombination.produced_amount30,
      ingredient: { name: pokemonCombination.ingredient30 },
    };

    return [produced0, produced30];
  }
}

export const PokemonCombination30DAO = new PokemonCombination30DAOImpl();
