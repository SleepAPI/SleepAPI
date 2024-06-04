import { Static, Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao';

const DBPokemonSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    saved: Type.Boolean(),
    external_id: Type.String({ minLength: 36, maxLength: 36 }),
    pokemon: Type.String(),
    name: Type.String(),
    skill_level: Type.Number(),
    carry_size: Type.Number(),
    level: Type.Number(),
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
}

export const PokemonDAO = new PokemonDAOImpl();
