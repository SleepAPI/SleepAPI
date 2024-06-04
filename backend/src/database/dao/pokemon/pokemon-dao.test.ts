/* eslint-disable @typescript-eslint/no-explicit-any */
import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
});

describe('PokemonDAO insert', () => {
  it('shall insert new entity', async () => {
    const pokemon = await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      external_id: uuid.v4(),
      pokemon: 'Pikachu',
      name: 'Sparky',
      skill_level: 5,
      carry_size: 10,
      level: 25,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_75: 'Electro Ball',
      subskill_100: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir',
    });
    expect(pokemon).toBeDefined();

    const data = await PokemonDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "carry_size": 10,
          "external_id": "000000000000000000000000000000000000",
          "fk_user_id": 1,
          "id": 1,
          "ingredient_0": "Berry",
          "ingredient_30": "Potion",
          "ingredient_60": "Elixir",
          "level": 25,
          "name": "Sparky",
          "nature": "Brave",
          "pokemon": "Pikachu",
          "saved": true,
          "skill_level": 5,
          "subskill_10": "Thunderbolt",
          "subskill_100": "Thunder",
          "subskill_25": "Quick Attack",
          "subskill_50": "Iron Tail",
          "subskill_75": "Electro Ball",
          "version": 1,
        },
      ]
    `);
  });

  it('shall fail to insert entity without fk_user_id', async () => {
    await expect(
      PokemonDAO.insert({
        fk_user_id: undefined as any,
        saved: true,
        external_id: uuid.v4(),
        pokemon: 'Pikachu',
        name: 'Sparky',
        skill_level: 5,
        carry_size: 10,
        level: 25,
        nature: 'Brave',
        subskill_10: 'Thunderbolt',
        subskill_25: 'Quick Attack',
        subskill_50: 'Iron Tail',
        subskill_75: 'Electro Ball',
        subskill_100: 'Thunder',
        ingredient_0: 'Berry',
        ingredient_30: 'Potion',
        ingredient_60: 'Elixir',
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: pokemon.fk_user_id/);
  });

  it('shall fail to insert entity without pokemon name', async () => {
    await expect(
      PokemonDAO.insert({
        fk_user_id: 1,
        saved: true,
        external_id: uuid.v4(),
        pokemon: undefined as any,
        name: 'Sparky',
        skill_level: 5,
        carry_size: 10,
        level: 25,
        nature: 'Brave',
        subskill_10: 'Thunderbolt',
        subskill_25: 'Quick Attack',
        subskill_50: 'Iron Tail',
        subskill_75: 'Electro Ball',
        subskill_100: 'Thunder',
        ingredient_0: 'Berry',
        ingredient_30: 'Potion',
        ingredient_60: 'Elixir',
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: pokemon.pokemon/);
  });
});

describe('PokemonDAO update', () => {
  it('shall update entity', async () => {
    const pokemon = await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      external_id: uuid.v4(),
      pokemon: 'Pikachu',
      name: 'Sparky',
      skill_level: 5,
      carry_size: 10,
      level: 25,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_75: 'Electro Ball',
      subskill_100: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir',
    });
    expect(pokemon.name).toEqual('Sparky');

    await PokemonDAO.update({ ...pokemon, name: 'Updated Sparky' });

    const data = await PokemonDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "carry_size": 10,
          "external_id": "000000000000000000000000000000000000",
          "fk_user_id": 1,
          "id": 1,
          "ingredient_0": "Berry",
          "ingredient_30": "Potion",
          "ingredient_60": "Elixir",
          "level": 25,
          "name": "Updated Sparky",
          "nature": "Brave",
          "pokemon": "Pikachu",
          "saved": true,
          "skill_level": 5,
          "subskill_10": "Thunderbolt",
          "subskill_100": "Thunder",
          "subskill_25": "Quick Attack",
          "subskill_50": "Iron Tail",
          "subskill_75": "Electro Ball",
          "version": 2,
        },
      ]
    `);
  });
});

describe('PokemonDAO delete', () => {
  it('shall delete entity', async () => {
    const pokemon = await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      external_id: uuid.v4(),
      pokemon: 'Pikachu',
      name: 'Sparky',
      skill_level: 5,
      carry_size: 10,
      level: 25,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_75: 'Electro Ball',
      subskill_100: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir',
    });

    await PokemonDAO.delete({ id: pokemon.id });

    const data = await PokemonDAO.findMultiple();
    expect(data).toEqual([]);
  });
});
