import { describe, expect, it } from 'vitest';
import { FANCY_APPLE, HONEY, SOOTHING_CACAO } from '../../domain/ingredient';
import { LONELY, NAUGHTY, QUIET } from '../../domain/nature';
import { GOLDUCK, PINSIR, RAICHU } from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  DREAM_SHARD_BONUS,
  HELPING_BONUS,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  SKILL_LEVEL_UP_M,
  SKILL_LEVEL_UP_S,
  SKILL_TRIGGER_M,
  SLEEP_EXP_BONUS,
} from '../../domain/subskill';
import { PokemonInstanceExt } from '../../domain/types/pokemon-instance';
import { RP } from '../../utils/rp-utils/rp';
import { uuid } from '../../utils/uuid-utils';

describe('RP', () => {
  it('shall calculate realistic level 50 Pokémon', () => {
    const pokemonInstance: PokemonInstanceExt = {
      pokemon: PINSIR,
      name: 'Paris',
      carrySize: 24,
      level: 50,
      ribbon: 0,
      nature: QUIET,
      skillLevel: 1,
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: INGREDIENT_FINDER_S },
        { level: 50, subskill: DREAM_SHARD_BONUS },
        { level: 75, subskill: SKILL_LEVEL_UP_S },
        { level: 100, subskill: SKILL_LEVEL_UP_M },
      ],
      ingredients: [
        { level: 0, ingredient: HONEY },
        { level: 30, ingredient: FANCY_APPLE },
        { level: 60, ingredient: HONEY },
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.helpFactor).toBe(8.299999999999999);
    expect(rpUtils.miscFactor).toBe(1.22);
    expect(rpUtils.ingredientFactor).toBe(1754.81);
    expect(rpUtils.berryFactor).toBe(398.99);
    expect(rpUtils.skillFactor).toBe(102.91);
    expect(rpUtils.calc()).toBe(2753);
  });

  it('shall calculate level 60 Pokémon', () => {
    const pokemonInstance: PokemonInstanceExt = {
      pokemon: PINSIR,
      name: 'Paris',
      carrySize: 24,
      level: 60,
      ribbon: 0,
      nature: QUIET,
      skillLevel: 1,
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: INGREDIENT_FINDER_S },
        { level: 50, subskill: DREAM_SHARD_BONUS },
        { level: 75, subskill: SKILL_LEVEL_UP_S },
        { level: 100, subskill: SKILL_LEVEL_UP_M },
      ],
      ingredients: [
        { level: 0, ingredient: HONEY },
        { level: 30, ingredient: FANCY_APPLE },
        { level: 60, ingredient: HONEY },
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(4281);
  });

  it('shall calculate skill Pokémon', () => {
    const pokemonInstance: PokemonInstanceExt = {
      pokemon: GOLDUCK,
      name: 'Golduck',
      carrySize: 19,
      level: 38,
      ribbon: 0,
      nature: LONELY,
      skillLevel: 7,
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: SKILL_TRIGGER_M },
        { level: 50, subskill: INVENTORY_L },
        { level: 75, subskill: INGREDIENT_FINDER_S },
        { level: 100, subskill: HELPING_SPEED_S },
      ],
      ingredients: [
        { level: 0, ingredient: SOOTHING_CACAO },
        { level: 30, ingredient: FANCY_APPLE },
        { level: 60, ingredient: SOOTHING_CACAO },
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(3726);
  });

  it('shall calculate berry Pokémon', () => {
    const pokemonInstance: PokemonInstanceExt = {
      pokemon: RAICHU,
      name: 'Thor',
      carrySize: 31,
      level: 53,
      ribbon: 0,
      nature: NAUGHTY,
      skillLevel: 4,
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: SLEEP_EXP_BONUS },
        { level: 50, subskill: SKILL_LEVEL_UP_S },
        { level: 75, subskill: HELPING_BONUS },
        { level: 100, subskill: SKILL_TRIGGER_M },
      ],
      ingredients: [
        { level: 0, ingredient: FANCY_APPLE },
        { level: 30, ingredient: FANCY_APPLE },
        { level: 60, ingredient: FANCY_APPLE },
      ],
      externalId: uuid.v4(),
      version: 0,
      saved: true,
      shiny: false,
    };
    const rpUtils = new RP(pokemonInstance);
    expect(rpUtils.calc()).toBe(3555);
  });
});
