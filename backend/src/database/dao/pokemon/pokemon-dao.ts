import { Static, Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao';
import { IngredientError } from '@src/domain/error/ingredient/ingredient-error';
import { IngredientInstance, SubskillInstance } from 'sleepapi-common';

const DBPokemonSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    saved: Type.Boolean(),
    shiny: Type.Boolean(),
    gender: Type.Optional(Type.Union([Type.Literal('male'), Type.Literal('female')])),
    external_id: Type.String({ minLength: 36, maxLength: 36 }),
    pokemon: Type.String(),
    name: Type.String(),
    skill_level: Type.Number(),
    carry_size: Type.Number(),
    level: Type.Number(),
    ribbon: Type.Number(),
    nature: Type.String(),
    subskill_10: Type.Optional(Type.String()),
    subskill_25: Type.Optional(Type.String()),
    subskill_50: Type.Optional(Type.String()),
    subskill_75: Type.Optional(Type.String()),
    subskill_100: Type.Optional(Type.String()),
    ingredient_0: Type.String(),
    ingredient_30: Type.String(),
    ingredient_60: Type.String(),
  }),
]);
export type DBPokemon = Static<typeof DBPokemonSchema>;
export type DBPokemonWithoutVersion = Omit<DBPokemon, 'id' | 'version'>;

class PokemonDAOImpl extends AbstractDAO<typeof DBPokemonSchema> {
  public tableName = 'pokemon';
  public schema = DBPokemonSchema;

  public filterFilledSubskills(subskills: DBPokemon): SubskillInstance[] {
    const filledSubskills: SubskillInstance[] = [];

    if (subskills.subskill_10) {
      filledSubskills.push({ level: 10, subskill: subskills.subskill_10 });
    }
    if (subskills.subskill_25) {
      filledSubskills.push({ level: 25, subskill: subskills.subskill_25 });
    }
    if (subskills.subskill_50) {
      filledSubskills.push({ level: 50, subskill: subskills.subskill_50 });
    }
    if (subskills.subskill_75) {
      filledSubskills.push({ level: 75, subskill: subskills.subskill_75 });
    }
    if (subskills.subskill_100) {
      filledSubskills.push({ level: 100, subskill: subskills.subskill_100 });
    }

    return filledSubskills;
  }

  public subskillForLevel(level: number, subskills: SubskillInstance[]) {
    return subskills.find((subskill) => subskill.level === level)?.subskill;
  }

  public ingredientForLevel(level: number, ingredients: IngredientInstance[]) {
    const ingredient = ingredients.find((ingredient) => ingredient.level === level)?.ingredient;
    if (!ingredient) {
      throw new IngredientError('Missing required ingredient in upsert member request for level: ' + level);
    }
    return ingredient;
  }
}

export const PokemonDAO = new PokemonDAOImpl();
