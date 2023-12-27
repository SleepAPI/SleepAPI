import { Static, Type } from '@sinclair/typebox';
import { IngredientDrop } from '../../../domain/produce/ingredient';
import { generateAllBuddyCombinations } from '../../../services/calculator/buddy/buddy-calculator';
import { combineSameIngredientsInDrop } from '../../../services/calculator/ingredient/ingredient-calculate';
import { Logger } from '../../../services/logger/logger';
import { getIngredientForname } from '../../../utils/ingredient-utils/ingredient-utils';
import { prettifyIngredientDrop } from '../../../utils/json/json-utils';
import { AbstractDAO, DBWithIdSchema } from '../abstract-dao';
import { PokemonCombination30DAO } from '../pokemon-combination30-dao';

const DBBuddyCombination30Schema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    fk_pokemon_combination30_id1: Type.Number(),
    fk_pokemon_combination30_id2: Type.Number(),
    produced: Type.String(),
  }),
]);
export type DBBuddyCombination30 = Static<typeof DBBuddyCombination30Schema>;

class BuddyCombination30DAOImpl extends AbstractDAO<typeof DBBuddyCombination30Schema> {
  public tableName = 'buddy_combination30';
  public schema = DBBuddyCombination30Schema;

  public async seed(): Promise<void> {
    const result = await this.findMultiple();
    if (result.length > 0) {
      return;
    }

    const pokemonCombinations = await PokemonCombination30DAO.findMultiple();
    const rawBuddyCombinations = generateAllBuddyCombinations(pokemonCombinations);

    const buddyCombinations = [];
    for (let i = 0, len1 = rawBuddyCombinations.length; i < len1; i++) {
      const produced: IngredientDrop[] = combineSameIngredientsInDrop(
        this.producedAfter6H(rawBuddyCombinations[i].buddy1, rawBuddyCombinations[i].buddy2)
      );
      buddyCombinations.push({
        fk_pokemon_combination30_id1: rawBuddyCombinations[i].buddy1.id,
        fk_pokemon_combination30_id2: rawBuddyCombinations[i].buddy2.id,
        produced: prettifyIngredientDrop(produced),
      });
    }

    Logger.info(`Calculated buddy_combination30, inserting ${buddyCombinations.length}`);
    return await this.batchInsert(buddyCombinations);
  }

  public producedAfter6H(
    buddy1: {
      ingredient0: string;
      ingredient30: string;
      ingredient60?: string;
      produced_amount0: number;
      produced_amount30: number;
    },
    buddy2: {
      ingredient0: string;
      ingredient30: string;
      ingredient60?: string;
      produced_amount0: number;
      produced_amount30: number;
    }
  ): IngredientDrop[] {
    return [
      {
        amount: buddy1.produced_amount0,
        ingredient: getIngredientForname(buddy1.ingredient0),
      },
      {
        amount: buddy1.produced_amount30,
        ingredient: getIngredientForname(buddy1.ingredient30),
      },

      {
        amount: buddy2.produced_amount0,
        ingredient: getIngredientForname(buddy2.ingredient0),
      },
      {
        amount: buddy2.produced_amount30,
        ingredient: getIngredientForname(buddy2.ingredient30),
      },
    ];
  }
}

export const BuddyCombination30DAO = new BuddyCombination30DAOImpl();
