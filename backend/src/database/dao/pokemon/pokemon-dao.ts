import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import { IngredientError } from '@src/domain/error/ingredient/ingredient-error.js';
import { getPokemon, type IngredientInstanceDto, type SubskillInstanceDto } from 'sleepapi-common';

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
    subskill_70: Type.Optional(Type.String()),
    subskill_80: Type.Optional(Type.String()),
    ingredient_0: Type.String(),
    ingredient_30: Type.String(),
    ingredient_60: Type.String()
  })
]);
export type DBPokemon = Static<typeof DBPokemonSchema>;
export type DBPokemonWithoutVersion = Omit<DBPokemon, 'id' | 'version'>;

class PokemonDAOImpl extends AbstractDAO<typeof DBPokemonSchema> {
  public tableName = 'pokemon';
  public schema = DBPokemonSchema;

  public filterFilledSubskills(subskills: DBPokemon): SubskillInstanceDto[] {
    const filledSubskills: SubskillInstanceDto[] = [];

    if (subskills.subskill_10) {
      filledSubskills.push({ level: 10, subskill: subskills.subskill_10 });
    }
    if (subskills.subskill_25) {
      filledSubskills.push({ level: 25, subskill: subskills.subskill_25 });
    }
    if (subskills.subskill_50) {
      filledSubskills.push({ level: 50, subskill: subskills.subskill_50 });
    }
    if (subskills.subskill_70) {
      filledSubskills.push({ level: 70, subskill: subskills.subskill_70 });
    }
    if (subskills.subskill_80) {
      filledSubskills.push({ level: 80, subskill: subskills.subskill_80 });
    }

    return filledSubskills;
  }

  public subskillForLevel(level: number, subskills: SubskillInstanceDto[]) {
    return subskills.find((subskill) => subskill.level === level)?.subskill;
  }

  public ingredientForLevel(level: number, ingredients: IngredientInstanceDto[]) {
    const ingredient = ingredients.find((ingredient) => ingredient.level === level)?.name;
    if (!ingredient) {
      throw new IngredientError('Missing required ingredient in upsert member request for level: ' + level);
    }
    return ingredient;
  }

  public filterChosenIngredientList(pokemonInstance: DBPokemon): IngredientInstanceDto[] {
    const { ingredient_0, ingredient_30, ingredient_60, pokemon } = pokemonInstance;
    const member = getPokemon(pokemon);
    return [
      {
        level: 0,
        name: ingredient_0,
        amount: member.ingredient0.find((ing) => ing.ingredient.name === ingredient_0)?.amount ?? 0
      },
      {
        level: 30,
        name: ingredient_30,
        amount: member.ingredient30.find((ing) => ing.ingredient.name === ingredient_30)?.amount ?? 0
      },
      {
        level: 60,
        name: ingredient_60,
        amount: member.ingredient60.find((ing) => ing.ingredient.name === ingredient_60)?.amount ?? 0
      }
    ];
  }
}

export const PokemonDAO = new PokemonDAOImpl();
