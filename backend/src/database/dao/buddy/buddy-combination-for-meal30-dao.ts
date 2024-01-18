import { Static, Type } from '@sinclair/typebox';
import { MealError } from '../../../domain/error/meal/meal-error';
import { BuddyForFlexibleRanking, BuddyForMeal } from '../../../domain/legacy/buddy-types';
import { IngredientDrop } from '../../../domain/produce/ingredient';
import { MEALS, Meal } from '../../../domain/recipe/meal';
import {
  calculateContributedPowerForMeal,
  calculatePercentageCoveredByCombination,
  combineSameIngredientsInDrop,
} from '../../../services/calculator/ingredient/ingredient-calculate';
import { Logger } from '../../../services/logger/logger';
import { getIngredientForname } from '../../../utils/ingredient-utils/ingredient-utils';
import { DatabaseService } from '../../database-service';
import { AbstractDAO, DBWithIdSchema } from '../abstract-dao';
import { PokemonCombination30DAO } from '../pokemon-combination30-dao';
import { BuddyCombination30DAO } from './buddy-combination30-dao';

const DBBuddyCombinationForMeal30Schema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    fk_buddy_combination30_id: Type.Number(),
    meal: Type.String(),

    percentage: Type.Number(),
    contributed_power: Type.Number(),
  }),
]);

export type DBBuddyCombinationForMeal30 = Static<typeof DBBuddyCombinationForMeal30Schema>;
interface RawBuddyProducedType {
  id: number;
  buddy1_ingredient0: string;
  buddy1_ingredient30: string;
  buddy1_produced_amount0: number;
  buddy1_produced_amount30: number;
  buddy2_ingredient0: string;
  buddy2_ingredient30: string;
  buddy2_produced_amount0: number;
  buddy2_produced_amount30: number;
}
interface RawBuddyForMealType {
  percentage: number;
  contributed_power: number;
  buddy1_pokemon: string;
  buddy1_ingredient0: string;
  buddy1_ingredient30: string;
  buddy1_amount0: number;
  buddy1_amount30: number;
  buddy1_produced_amount0: number;
  buddy1_produced_amount30: number;
  buddy2_pokemon: string;
  buddy2_ingredient0: string;
  buddy2_ingredient30: string;
  buddy2_amount0: number;
  buddy2_amount30: number;
  buddy2_produced_amount0: number;
  buddy2_produced_amount30: number;
}
interface RawFlexibleRankingType {
  average_percentage: number;
  buddy1_pokemon: string;
  buddy1_ingredient0: string;
  buddy1_ingredient30: string;
  buddy1_amount0: number;
  buddy1_amount30: number;
  buddy2_pokemon: string;
  buddy2_ingredient0: string;
  buddy2_ingredient30: string;
  buddy2_amount0: number;
  buddy2_amount30: number;
}

class BuddyCombinationForMeal30DAOImpl extends AbstractDAO<typeof DBBuddyCombinationForMeal30Schema> {
  public tableName = 'buddy_combination_for_meal30';
  public schema = DBBuddyCombinationForMeal30Schema;

  public async seed(enableLogging?: boolean): Promise<void> {
    const result = await this.findMultiple();
    if (result.length > 0) {
      return;
    }

    const knex = await DatabaseService.getKnex();

    let counter = 0;

    const buddyCombinations: RawBuddyProducedType[] = await knex
      .from(BuddyCombination30DAO.tableName)
      .leftJoin(
        `${PokemonCombination30DAO.tableName} AS buddy1`,
        `${BuddyCombination30DAO.tableName}.fk_pokemon_combination30_id1`,
        `buddy1.id`
      )
      .leftJoin(
        `${PokemonCombination30DAO.tableName} AS buddy2`,
        `${BuddyCombination30DAO.tableName}.fk_pokemon_combination30_id2`,
        `buddy2.id`
      )
      .select(
        `${BuddyCombination30DAO.tableName}.id`,
        `buddy1.ingredient0 AS buddy1_ingredient0`,
        `buddy1.ingredient30 AS buddy1_ingredient30`,
        `buddy1.produced_amount0 AS buddy1_produced_amount0`,
        `buddy1.produced_amount30 AS buddy1_produced_amount30`,
        `buddy2.ingredient0 AS buddy2_ingredient0`,
        `buddy2.ingredient30 AS buddy2_ingredient30`,
        `buddy2.produced_amount0 AS buddy2_produced_amount0`,
        `buddy2.produced_amount30 AS buddy2_produced_amount30`
      );

    for (const meal of MEALS) {
      const buddyCombinationsForMeal = [];

      for (const buddyCombination of buddyCombinations) {
        const buddyProduced = this.#rawBuddyProducedTypeAsBuddies(buddyCombination);
        const buddyCombinationProduced6H = BuddyCombination30DAO.producedAfter6H(
          buddyProduced.buddy1,
          buddyProduced.buddy2
        );

        const produced6HCombined = combineSameIngredientsInDrop(buddyCombinationProduced6H);

        const percentage = calculatePercentageCoveredByCombination(meal, produced6HCombined);
        const contributed_power = calculateContributedPowerForMeal(meal, percentage);

        buddyCombinationsForMeal.push({
          fk_buddy_combination30_id: buddyCombination.id,
          meal: meal.name,
          percentage,
          contributed_power,
        });

        if ((enableLogging && ++counter % 100000 == 0) || counter == MEALS.length * buddyCombinations.length) {
          Logger.info(`Processed [${counter}] buddy_combination_for_meal30`);
        }
      }
      await this.batchInsert(buddyCombinationsForMeal);
    }
  }

  public async getBuddyCombinationsForMeal(params: {
    mealName: string;
    allowedBerries: string[];
    page: number;
  }): Promise<BuddyForMeal> {
    const { mealName, allowedBerries, page } = params;
    const pageSize = 100;
    const offset = page * pageSize - 100;
    const knex = await DatabaseService.getKnex();

    const meal: Meal | undefined = MEALS.find((meal) => meal.name === mealName.toUpperCase());
    if (!meal) {
      throw new MealError("Couldn't find meal with name: " + mealName.toUpperCase());
    }

    const pokemonCombinations: RawBuddyForMealType[] = await knex
      .from(this.tableName)
      .leftJoin(
        BuddyCombination30DAO.tableName,
        `${this.tableName}.fk_buddy_combination30_id`,
        `${BuddyCombination30DAO.tableName}.id`
      )
      .leftJoin(
        `${PokemonCombination30DAO.tableName} AS buddy1`,
        `${BuddyCombination30DAO.tableName}.fk_pokemon_combination30_id1`,
        `buddy1.id`
      )
      .leftJoin(
        `${PokemonCombination30DAO.tableName} AS buddy2`,
        `${BuddyCombination30DAO.tableName}.fk_pokemon_combination30_id2`,
        `buddy2.id`
      )
      .select(
        `${this.tableName}.percentage`,
        `${this.tableName}.contributed_power`,
        'buddy1.pokemon AS buddy1_pokemon',
        `buddy1.ingredient0 AS buddy1_ingredient0`,
        `buddy1.ingredient30 AS buddy1_ingredient30`,
        `buddy1.amount0 AS buddy1_amount0`,
        `buddy1.amount30 AS buddy1_amount30`,
        `buddy1.produced_amount0 AS buddy1_produced_amount0`,
        `buddy1.produced_amount30 AS buddy1_produced_amount30`,
        'buddy2.pokemon AS buddy2_pokemon',
        `buddy2.ingredient0 AS buddy2_ingredient0`,
        `buddy2.ingredient30 AS buddy2_ingredient30`,
        `buddy2.amount0 AS buddy2_amount0`,
        `buddy2.amount30 AS buddy2_amount30`,
        `buddy2.produced_amount0 AS buddy2_produced_amount0`,
        `buddy2.produced_amount30 AS buddy2_produced_amount30`
      )
      .whereIn('buddy1.berry', allowedBerries)
      .whereIn('buddy2.berry', allowedBerries)
      .where({ meal: meal.name })
      .orderBy(`${this.tableName}.percentage`, 'desc')
      .offset(offset)
      .limit(pageSize);

    return {
      meal: meal.name,
      bonus: meal.bonus,
      value: meal.value,
      recipe: meal.ingredients,
      combinations: this.#structureCombination(pokemonCombinations),
    };
  }

  public async getBuddyFlexibleRanking(params: { meals: string[]; allowedBerries: string[]; page: number }) {
    const { meals, allowedBerries, page } = params;
    const pageSize = 10;
    const offset = page * pageSize - pageSize;

    const knex = await DatabaseService.getKnex();

    const avgBuddy = knex
      .from(this.tableName)
      .leftJoin(BuddyCombination30DAO.tableName, 'fk_buddy_combination30_id', `${BuddyCombination30DAO.tableName}.id`)
      .leftJoin(
        `${PokemonCombination30DAO.tableName} AS buddy1`,
        `${BuddyCombination30DAO.tableName}.fk_pokemon_combination30_id1`,
        'buddy1.id'
      )
      .leftJoin(
        `${PokemonCombination30DAO.tableName} AS buddy2`,
        `${BuddyCombination30DAO.tableName}.fk_pokemon_combination30_id2`,
        'buddy2.id'
      )
      .select(
        'buddy1.pokemon AS buddy1_pokemon',
        'buddy1.ingredient0 AS buddy1_ingredient0',
        'buddy1.ingredient30 AS buddy1_ingredient30',
        'buddy1.amount0 AS buddy1_amount0',
        'buddy1.amount30 AS buddy1_amount30',
        'buddy2.pokemon AS buddy2_pokemon',
        'buddy2.ingredient0 AS buddy2_ingredient0',
        'buddy2.ingredient30 AS buddy2_ingredient30',
        'buddy2.amount0 AS buddy2_amount0',
        'buddy2.amount30 AS buddy2_amount30'
      )
      .avg('percentage as average_percentage')
      .groupBy('fk_buddy_combination30_id')
      .whereIn('meal', meals)
      .whereIn('buddy1.berry', allowedBerries)
      .whereIn('buddy2.berry', allowedBerries)
      .as('avg_buddy');

    const pokemonCombinations: RawFlexibleRankingType[] = await knex
      .from(avgBuddy)
      .select(
        'avg_buddy.average_percentage',
        'avg_buddy.buddy1_pokemon',
        'avg_buddy.buddy1_ingredient0',
        'avg_buddy.buddy1_ingredient30',
        'avg_buddy.buddy1_amount0',
        'avg_buddy.buddy1_amount30',
        'avg_buddy.buddy2_pokemon',
        'avg_buddy.buddy2_ingredient0',
        'avg_buddy.buddy2_ingredient30',
        'avg_buddy.buddy2_amount0',
        'avg_buddy.buddy2_amount30'
      )
      .orderBy('avg_buddy.average_percentage', 'desc')
      .offset(offset)
      .limit(pageSize);

    return this.#structureFlexibleRanking(pokemonCombinations);
  }

  #rawBuddyProducedTypeAsBuddies(buddyCombination: RawBuddyProducedType) {
    const buddy1 = {
      ingredient0: buddyCombination.buddy1_ingredient0,
      ingredient30: buddyCombination.buddy1_ingredient30,
      produced_amount0: buddyCombination.buddy1_produced_amount0,
      produced_amount30: buddyCombination.buddy1_produced_amount30,
    };
    const buddy2 = {
      ingredient0: buddyCombination.buddy2_ingredient0,
      ingredient30: buddyCombination.buddy2_ingredient30,
      produced_amount0: buddyCombination.buddy2_produced_amount0,
      produced_amount30: buddyCombination.buddy2_produced_amount30,
    };
    return { buddy1, buddy2 };
  }

  #structureCombination(pokemonCombinations: RawBuddyForMealType[]) {
    const structuredCombinations = [];
    for (const combination of pokemonCombinations) {
      const buddy1_ingredientList: IngredientDrop[] = [
        {
          amount: combination.buddy1_amount0,
          ingredient: getIngredientForname(combination.buddy1_ingredient0),
        },
        {
          amount: combination.buddy1_amount30,
          ingredient: getIngredientForname(combination.buddy1_ingredient30),
        },
      ];
      const buddy1_producedIngredients: IngredientDrop[] = [
        {
          amount: combination.buddy1_produced_amount0,
          ingredient: getIngredientForname(combination.buddy1_ingredient0),
        },
        {
          amount: combination.buddy1_produced_amount30,
          ingredient: getIngredientForname(combination.buddy1_ingredient30),
        },
      ];
      const buddy2_ingredientList: IngredientDrop[] = [
        {
          amount: combination.buddy2_amount0,
          ingredient: getIngredientForname(combination.buddy2_ingredient0),
        },
        {
          amount: combination.buddy2_amount30,
          ingredient: getIngredientForname(combination.buddy2_ingredient30),
        },
      ];
      const buddy2_producedIngredients: IngredientDrop[] = [
        {
          amount: combination.buddy2_produced_amount0,
          ingredient: getIngredientForname(combination.buddy2_ingredient0),
        },
        {
          amount: combination.buddy2_produced_amount30,
          ingredient: getIngredientForname(combination.buddy2_ingredient30),
        },
      ];
      const structuredCombination = {
        percentage: combination.percentage,
        contributed_power: combination.contributed_power,
        buddy1_pokemon: combination.buddy1_pokemon,
        buddy1_ingredientList,
        buddy1_producedIngredients: combineSameIngredientsInDrop(buddy1_producedIngredients),
        buddy2_pokemon: combination.buddy2_pokemon,
        buddy2_ingredientList,
        buddy2_producedIngredients: combineSameIngredientsInDrop(buddy2_producedIngredients),
      };
      structuredCombinations.push(structuredCombination);
    }
    return structuredCombinations;
  }

  #structureFlexibleRanking(buddyCombinations: RawFlexibleRankingType[]) {
    const structuredCombinations: BuddyForFlexibleRanking[] = [];
    for (const combination of buddyCombinations) {
      const buddy1_ingredientList: IngredientDrop[] = [
        {
          amount: combination.buddy1_amount0,
          ingredient: getIngredientForname(combination.buddy1_ingredient0),
        },
        {
          amount: combination.buddy1_amount30,
          ingredient: getIngredientForname(combination.buddy1_ingredient30),
        },
      ];
      const buddy2_ingredientList: IngredientDrop[] = [
        {
          amount: combination.buddy2_amount0,
          ingredient: getIngredientForname(combination.buddy2_ingredient0),
        },
        {
          amount: combination.buddy2_amount30,
          ingredient: getIngredientForname(combination.buddy2_ingredient30),
        },
      ];

      const structuredCombination: BuddyForFlexibleRanking = {
        average_percentage: combination.average_percentage,
        buddy1_pokemon: combination.buddy1_pokemon,
        buddy1_ingredientList,
        buddy2_pokemon: combination.buddy2_pokemon,
        buddy2_ingredientList,
      };
      structuredCombinations.push(structuredCombination);
    }
    return structuredCombinations;
  }
}

export const BuddyCombinationForMeal30DAO = new BuddyCombinationForMeal30DAOImpl();
