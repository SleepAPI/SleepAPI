import { Static, Type } from '@sinclair/typebox';
import {
  AllCombinationsForMealType,
  CombinationForFlexibleRankingType,
  CombinationForFocusedRankingType,
  CombinationForMealType,
} from '../../domain/combination/combination';
import { IngredientDrop } from '../../domain/produce/ingredient';
import { MEALS, Meal } from '../../domain/recipe/meal';
import {
  calculateContributedPowerForMeal,
  calculatePercentageCoveredByCombination,
  combineSameIngredientsInDrop,
} from '../../services/calculator/ingredient/ingredient-calculate';
import { Logger } from '../../services/logger/logger';
import { getIngredientForname } from '../../utils/ingredient-utils/ingredient-utils';
import { DatabaseService } from '../database-service';
import { AbstractDAO, DBWithIdSchema } from './abstract-dao';
import { PokemonCombination30DAO } from './pokemon-combination30-dao';

const DBPokemonCombinationForMeal30Schema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    fk_pokemon_combination_id: Type.Number(),
    meal: Type.String(),

    percentage: Type.Number(),
    contributed_power: Type.Number(),
  }),
]);

export type DBPokemonCombinationForMeal30 = Static<typeof DBPokemonCombinationForMeal30Schema>;
interface RawCombinationForMealType {
  pokemon: string;
  percentage: string;
  contributed_power: string;
  ingredient0: string;
  amount0: number;
  produced_amount0: number;
  ingredient30: string;
  amount30: number;
  produced_amount30: number;
}
interface RawFlexibleRanking30Type {
  pokemon: string;
  average_percentage: number;
  ingredient0: string;
  amount0: number;
  ingredient30: string;
  amount30: number;
}
interface RawFocusedRanking30Type {
  pokemon: string;
  total: number;
  meals: string;
  ingredient0: string;
  amount0: number;
  ingredient30: string;
  amount30: number;
}
interface RawPokemonRanking30Type {
  pokemon: string;
  average_percentage: number;
  generalist_ranking: number;
  ingredient0: string;
  amount0: number;
  produced_amount0: number;
  ingredient30: string;
  amount30: number;
  produced_amount30: number;
  meals: {
    meal: string;
    percentage: number;
  }[];
}

class PokemonCombinationForMeal30DAOImpl extends AbstractDAO<typeof DBPokemonCombinationForMeal30Schema> {
  public tableName = 'pokemon_combination_for_meal30';
  public schema = DBPokemonCombinationForMeal30Schema;

  public async seed(enableLogging?: boolean): Promise<void> {
    const result = await this.findMultiple();
    if (result.length > 0) {
      return;
    }

    let counter = 0;

    const pokemonCombinations = await PokemonCombination30DAO.findMultiple();

    for (const meal of MEALS) {
      const pokemonCombinationsForMeal = [];

      for (const pokemonCombination of pokemonCombinations) {
        const pokemonCombinationProduced6H = await PokemonCombination30DAO.producedAfter6H(pokemonCombination);

        const percentage = calculatePercentageCoveredByCombination(meal, pokemonCombinationProduced6H);
        const contributed_power = calculateContributedPowerForMeal(meal, percentage);

        pokemonCombinationsForMeal.push({
          fk_pokemon_combination_id: pokemonCombination.id,
          meal: meal.name,
          percentage,
          contributed_power,
        });
        if ((enableLogging && ++counter % 1000 == 0) || counter == MEALS.length * pokemonCombinations.length) {
          Logger.info(`Processed [${counter}] pokemon_combination_for_meal30`);
        }
      }
      await this.batchInsert(pokemonCombinationsForMeal);
    }
  }

  public async getPokemonCombinationsForMeal(
    mealName: string,
    allowedBerries: string[]
  ): Promise<AllCombinationsForMealType> {
    const knex = await DatabaseService.getKnex();

    const meal: Meal | undefined = MEALS.find((meal) => meal.name === mealName.toUpperCase());
    if (!meal) {
      throw new Error("Couldn't find meal with name: " + mealName.toUpperCase());
    }

    const pokemonCombinations: RawCombinationForMealType[] = await knex
      .from(this.tableName)
      .leftJoin(
        PokemonCombination30DAO.tableName,
        `${this.tableName}.fk_pokemon_combination_id`,
        `${PokemonCombination30DAO.tableName}.id`
      )
      .select(
        `${PokemonCombination30DAO.tableName}.pokemon`,
        `${this.tableName}.percentage`,
        `${this.tableName}.contributed_power`,
        `${PokemonCombination30DAO.tableName}.ingredient0`,
        `${PokemonCombination30DAO.tableName}.produced_amount0`,
        `${PokemonCombination30DAO.tableName}.amount0`,
        `${PokemonCombination30DAO.tableName}.ingredient30`,
        `${PokemonCombination30DAO.tableName}.amount30`,
        `${PokemonCombination30DAO.tableName}.produced_amount30`
      )
      .whereIn('berry', allowedBerries)
      .andWhere({ meal: meal.name })
      .orderBy(`${this.tableName}.percentage`, 'desc')
      .orderBy(`${PokemonCombination30DAO.tableName}.produced_amount0`, 'desc');

    return {
      meal: meal.name,
      bonus: meal.bonus,
      value: meal.value,
      recipe: meal.ingredients,
      combinations: this.#structureCombination(pokemonCombinations),
    };
  }

  public async getFlexibleRankingForMeals(meals: string[], allowedBerries: string[]) {
    const knex = await DatabaseService.getKnex();

    const pokemonCombinations: RawFlexibleRanking30Type[] = await knex
      .from(this.tableName)
      .leftJoin(
        PokemonCombination30DAO.tableName,
        `${this.tableName}.fk_pokemon_combination_id`,
        `${PokemonCombination30DAO.tableName}.id`
      )
      .select(
        `${PokemonCombination30DAO.tableName}.pokemon`,
        `${PokemonCombination30DAO.tableName}.ingredient0`,
        `${PokemonCombination30DAO.tableName}.amount0`,
        `${PokemonCombination30DAO.tableName}.ingredient30`,
        `${PokemonCombination30DAO.tableName}.amount30`
      )
      .avg('percentage as average_percentage')
      .whereIn('meal', meals)
      .whereIn('berry', allowedBerries)
      .groupBy('fk_pokemon_combination_id')
      .orderBy('average_percentage', 'desc');

    return this.#structureFlexibleRanking(pokemonCombinations);
  }

  public async getFocusedRankingForMeals(mealNames: string[], allowedBerries: string[], nrOfMeals: number) {
    const knex = await DatabaseService.getKnex();

    const subquery = knex
      .from(this.tableName)
      .leftJoin(
        PokemonCombination30DAO.tableName,
        `${this.tableName}.fk_pokemon_combination_id`,
        `${PokemonCombination30DAO.tableName}.id`
      )
      .select(
        `${PokemonCombination30DAO.tableName}.pokemon`,
        `${PokemonCombination30DAO.tableName}.ingredient0`,
        `${PokemonCombination30DAO.tableName}.amount0`,
        `${PokemonCombination30DAO.tableName}.ingredient30`,
        `${PokemonCombination30DAO.tableName}.amount30`,
        'fk_pokemon_combination_id',
        'contributed_power',
        'meal'
      )
      .select(
        knex.raw('ROW_NUMBER() OVER (PARTITION BY fk_pokemon_combination_id ORDER BY contributed_power DESC) as rn')
      )
      .whereIn('meal', mealNames)
      .whereIn('berry', allowedBerries)
      .as('x');

    const pokemonCombinations: RawFocusedRanking30Type[] = await knex
      .select(
        'x.pokemon',
        'x.ingredient0',
        'x.amount0',
        'x.ingredient30',
        'x.amount30',
        knex.raw('GROUP_CONCAT(meal) as meals')
      )
      .sum({ total: 'contributed_power' })
      .from(subquery)
      .where('rn', '<=', nrOfMeals)
      .groupBy('fk_pokemon_combination_id')
      .orderBy('total', 'desc');

    return this.#structureFocusedRanking(pokemonCombinations);
  }

  public async getCombinationDataForPokemon(pokemonName: string, mealNames: string[]) {
    const knex = await DatabaseService.getKnex();
    const pokemonCombinations = await PokemonCombination30DAO.findMultiple({
      pokemon: pokemonName.toUpperCase(),
    });

    const mealDataForPokemonCombinations: RawPokemonRanking30Type[] = [];
    for (const combination of pokemonCombinations) {
      const rawRanking: {
        fk_pokemon_combination_id: number;
        average_percentage: number;
      }[] = await knex
        .from(this.tableName)
        .select('fk_pokemon_combination_id')
        .avg('percentage as average_percentage')
        .whereIn('meal', mealNames)
        .groupBy('fk_pokemon_combination_id')
        .orderBy('average_percentage', 'desc');
      const generalist_ranking = rawRanking.map((rank) => rank.fk_pokemon_combination_id).indexOf(combination.id);
      const average_percentage = rawRanking[generalist_ranking].average_percentage;

      const rawMealWithPercentage: { meal: string; percentage: number }[] = await knex
        .from(this.tableName)
        .select('meal', 'percentage')
        .whereIn('meal', mealNames)
        .andWhere('fk_pokemon_combination_id', combination.id);

      const mealData: RawPokemonRanking30Type = {
        pokemon: combination.pokemon,
        average_percentage,
        generalist_ranking: generalist_ranking + 1,
        ingredient0: combination.ingredient0,
        amount0: combination.amount0,
        produced_amount0: combination.produced_amount0,
        ingredient30: combination.ingredient30,
        amount30: combination.amount30,
        produced_amount30: combination.produced_amount30,
        meals: rawMealWithPercentage,
      };
      mealDataForPokemonCombinations.push(mealData);
    }
    return this.#structurePokemonRanking(mealDataForPokemonCombinations);
  }

  #structureCombination(pokemonCombinations: RawCombinationForMealType[]) {
    const structuredCombinations: CombinationForMealType[] = [];
    for (const combination of pokemonCombinations) {
      const ingredientList: IngredientDrop[] = [
        {
          amount: combination.amount0,
          ingredient: getIngredientForname(combination.ingredient0),
        },
        {
          amount: combination.amount30,
          ingredient: getIngredientForname(combination.ingredient30),
        },
      ];
      const producedIngredients: IngredientDrop[] = [
        {
          amount: combination.produced_amount0,
          ingredient: getIngredientForname(combination.ingredient0),
        },
        {
          amount: combination.produced_amount30,
          ingredient: getIngredientForname(combination.ingredient30),
        },
      ];

      const structuredCombination: CombinationForMealType = {
        pokemon: combination.pokemon,
        percentage: combination.percentage,
        contributedPower: combination.contributed_power,
        ingredientList,
        producedIngredients: combineSameIngredientsInDrop(producedIngredients),
      };
      structuredCombinations.push(structuredCombination);
    }
    return structuredCombinations;
  }

  #structureFlexibleRanking(pokemonCombinations: RawFlexibleRanking30Type[]) {
    const structuredCombinations: CombinationForFlexibleRankingType[] = [];
    for (const combination of pokemonCombinations) {
      const ingredientList: IngredientDrop[] = [
        {
          amount: combination.amount0,
          ingredient: getIngredientForname(combination.ingredient0),
        },
        {
          amount: combination.amount30,
          ingredient: getIngredientForname(combination.ingredient30),
        },
      ];

      const structuredCombination: CombinationForFlexibleRankingType = {
        pokemon: combination.pokemon,
        averagePercentage: combination.average_percentage,
        ingredientList,
      };
      structuredCombinations.push(structuredCombination);
    }
    return structuredCombinations;
  }

  #structureFocusedRanking(pokemonCombinations: RawFocusedRanking30Type[]) {
    const structuredCombinations: CombinationForFocusedRankingType[] = [];
    for (const combination of pokemonCombinations) {
      const ingredientList: IngredientDrop[] = [
        {
          amount: combination.amount0,
          ingredient: getIngredientForname(combination.ingredient0),
        },
        {
          amount: combination.amount30,
          ingredient: getIngredientForname(combination.ingredient30),
        },
      ];

      const structuredCombination: CombinationForFocusedRankingType = {
        pokemon: combination.pokemon,
        total: combination.total,
        meals: combination.meals,
        ingredientList,
      };
      structuredCombinations.push(structuredCombination);
    }
    return structuredCombinations;
  }

  #structurePokemonRanking(pokemonCombinations: RawPokemonRanking30Type[]) {
    const structuredCombinations = [];
    for (const combination of pokemonCombinations) {
      const ingredientList: IngredientDrop[] = [
        {
          amount: combination.amount0,
          ingredient: getIngredientForname(combination.ingredient0),
        },
        {
          amount: combination.amount30,
          ingredient: getIngredientForname(combination.ingredient30),
        },
      ];
      const producedIngredients: IngredientDrop[] = [
        {
          amount: combination.produced_amount0,
          ingredient: getIngredientForname(combination.ingredient0),
        },
        {
          amount: combination.produced_amount30,
          ingredient: getIngredientForname(combination.ingredient30),
        },
      ];

      const structuredCombination = {
        pokemon: combination.pokemon,
        ingredientList: ingredientList,
        ingredientsProduced: combineSameIngredientsInDrop(producedIngredients),
        averagePercentage: combination.average_percentage,
        generalistRanking: combination.generalist_ranking,
        meals: combination.meals,
      };
      structuredCombinations.push(structuredCombination);
    }
    return structuredCombinations;
  }
}

export const PokemonCombinationForMeal30DAO = new PokemonCombinationForMeal30DAOImpl();
