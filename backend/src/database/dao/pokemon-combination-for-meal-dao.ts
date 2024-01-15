import { Static, Type } from '@sinclair/typebox';
import {
  AllCombinationsForMealType,
  CombinationForFlexibleRankingType,
  CombinationForFocusedRankingType,
  CombinationForMealType,
} from '../../domain/combination/combination';
import { MealError } from '../../domain/error/meal/meal-error';
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
import { PokemonCombinationDAO } from './pokemon-combination-dao';

const DBPokemonCombinationForMealSchema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    fk_pokemon_combination_id: Type.Number(),
    meal: Type.String(),

    percentage: Type.Number(),
    contributed_power: Type.Number(),
  }),
]);

export type DBPokemonCombinationForMeal = Static<typeof DBPokemonCombinationForMealSchema>;
interface RawCombinationType {
  pokemon: string;
  percentage: string;
  contributed_power: string;
  ingredient0: string;
  amount0: number;
  produced_amount0: number;
  ingredient30: string;
  amount30: number;
  produced_amount30: number;
  ingredient60: string;
  amount60: number;
  produced_amount60: number;
}
interface RawFlexibleRankingType {
  pokemon: string;
  average_percentage: number;
  ingredient0: string;
  amount0: number;
  ingredient30: string;
  amount30: number;
  ingredient60: string;
  amount60: number;
}
interface RawFocusedRankingType {
  pokemon: string;
  total: number;
  meals: string;
  ingredient0: string;
  amount0: number;
  ingredient30: string;
  amount30: number;
  ingredient60: string;
  amount60: number;
}
interface RawPokemonRankingType {
  pokemon: string;
  average_percentage: number;
  generalist_ranking: number;
  ingredient0: string;
  amount0: number;
  produced_amount0: number;
  ingredient30: string;
  amount30: number;
  produced_amount30: number;
  ingredient60: string;
  amount60: number;
  produced_amount60: number;
  meals: {
    meal: string;
    percentage: number;
  }[];
}

class PokemonCombinationForMealDAOImpl extends AbstractDAO<typeof DBPokemonCombinationForMealSchema> {
  public tableName = 'pokemon_combination_for_meal';
  public schema = DBPokemonCombinationForMealSchema;

  public async seed(enableLogging?: boolean): Promise<void> {
    const result = await this.findMultiple();
    if (result.length > 0) {
      return;
    }

    let counter = 0;

    const pokemonCombinations = await PokemonCombinationDAO.findMultiple();

    for (const meal of MEALS) {
      const pokemonCombinationsForMeal = [];

      for (const pokemonCombination of pokemonCombinations) {
        const pokemonCombinationProduced6H = await PokemonCombinationDAO.producedAfter6H(pokemonCombination);

        const percentage = calculatePercentageCoveredByCombination(meal, pokemonCombinationProduced6H);
        const contributed_power = calculateContributedPowerForMeal(meal, percentage);

        pokemonCombinationsForMeal.push({
          fk_pokemon_combination_id: pokemonCombination.id,
          meal: meal.name,
          percentage,
          contributed_power,
        });
        if ((enableLogging && ++counter % 1000 == 0) || counter == MEALS.length * pokemonCombinations.length) {
          Logger.info(`Processed [${counter}] pokemon_combination_for_meal`);
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
      throw new MealError("Couldn't find meal with name: " + mealName.toUpperCase());
    }

    const pokemonCombinations: RawCombinationType[] = await knex
      .from(this.tableName)
      .leftJoin(
        PokemonCombinationDAO.tableName,
        `${this.tableName}.fk_pokemon_combination_id`,
        `${PokemonCombinationDAO.tableName}.id`
      )
      .select(
        `${PokemonCombinationDAO.tableName}.pokemon`,
        `${this.tableName}.percentage`,
        `${this.tableName}.contributed_power`,
        `${PokemonCombinationDAO.tableName}.ingredient0`,
        `${PokemonCombinationDAO.tableName}.produced_amount0`,
        `${PokemonCombinationDAO.tableName}.amount0`,
        `${PokemonCombinationDAO.tableName}.ingredient30`,
        `${PokemonCombinationDAO.tableName}.amount30`,
        `${PokemonCombinationDAO.tableName}.produced_amount30`,
        `${PokemonCombinationDAO.tableName}.ingredient60`,
        `${PokemonCombinationDAO.tableName}.amount60`,
        `${PokemonCombinationDAO.tableName}.produced_amount60`
      )
      .whereIn('berry', allowedBerries)
      .andWhere({ meal: meal.name })
      .orderBy(`${this.tableName}.percentage`, 'desc')
      .orderBy(`${PokemonCombinationDAO.tableName}.produced_amount0`, 'desc');

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

    const pokemonCombinations: RawFlexibleRankingType[] = await knex
      .from(this.tableName)
      .leftJoin(
        PokemonCombinationDAO.tableName,
        `${this.tableName}.fk_pokemon_combination_id`,
        `${PokemonCombinationDAO.tableName}.id`
      )
      .select(
        `${PokemonCombinationDAO.tableName}.pokemon`,
        `${PokemonCombinationDAO.tableName}.ingredient0`,
        `${PokemonCombinationDAO.tableName}.amount0`,
        `${PokemonCombinationDAO.tableName}.ingredient30`,
        `${PokemonCombinationDAO.tableName}.amount30`,
        `${PokemonCombinationDAO.tableName}.ingredient60`,
        `${PokemonCombinationDAO.tableName}.amount60`
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
        PokemonCombinationDAO.tableName,
        `${this.tableName}.fk_pokemon_combination_id`,
        `${PokemonCombinationDAO.tableName}.id`
      )
      .select(
        `${PokemonCombinationDAO.tableName}.pokemon`,
        `${PokemonCombinationDAO.tableName}.ingredient0`,
        `${PokemonCombinationDAO.tableName}.amount0`,
        `${PokemonCombinationDAO.tableName}.ingredient30`,
        `${PokemonCombinationDAO.tableName}.amount30`,
        `${PokemonCombinationDAO.tableName}.ingredient60`,
        `${PokemonCombinationDAO.tableName}.amount60`,
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

    const pokemonCombinations: RawFocusedRankingType[] = await knex
      .select(
        'x.pokemon',
        'x.ingredient0',
        'x.amount0',
        'x.ingredient30',
        'x.amount30',
        'x.ingredient60',
        'x.amount60',
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
    const pokemonCombinations = await PokemonCombinationDAO.findMultiple({ pokemon: pokemonName.toUpperCase() });

    const mealDataForPokemonCombinations: RawPokemonRankingType[] = [];
    for (const combination of pokemonCombinations) {
      const rawRanking: { fk_pokemon_combination_id: number; average_percentage: number }[] = await knex
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

      const mealData: RawPokemonRankingType = {
        pokemon: combination.pokemon,
        average_percentage,
        generalist_ranking: generalist_ranking + 1,
        ingredient0: combination.ingredient0,
        amount0: combination.amount0,
        produced_amount0: combination.produced_amount0,
        ingredient30: combination.ingredient30,
        amount30: combination.amount30,
        produced_amount30: combination.produced_amount30,
        ingredient60: combination.ingredient60,
        amount60: combination.amount60,
        produced_amount60: combination.produced_amount60,
        meals: rawMealWithPercentage,
      };
      mealDataForPokemonCombinations.push(mealData);
    }
    return this.#structurePokemonRanking(mealDataForPokemonCombinations);
  }

  #structureCombination(pokemonCombinations: RawCombinationType[]) {
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
        {
          amount: combination.amount60,
          ingredient: getIngredientForname(combination.ingredient60),
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
        {
          amount: combination.produced_amount60,
          ingredient: getIngredientForname(combination.ingredient60),
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

  #structureFlexibleRanking(pokemonCombinations: RawFlexibleRankingType[]) {
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
        {
          amount: combination.amount60,
          ingredient: getIngredientForname(combination.ingredient60),
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

  #structureFocusedRanking(pokemonCombinations: RawFocusedRankingType[]) {
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
        {
          amount: combination.amount60,
          ingredient: getIngredientForname(combination.ingredient60),
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

  #structurePokemonRanking(pokemonCombinations: RawPokemonRankingType[]) {
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
        {
          amount: combination.amount60,
          ingredient: getIngredientForname(combination.ingredient60),
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
        {
          amount: combination.produced_amount60,
          ingredient: getIngredientForname(combination.ingredient60),
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

export const PokemonCombinationForMealDAO = new PokemonCombinationForMealDAOImpl();
