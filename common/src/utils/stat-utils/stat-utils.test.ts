import { describe, expect, it } from 'vitest';
import { BRAVE, MILD, SASSY } from '../../domain/nature';
import {
  ABSOL,
  CATERPIE,
  CHARIZARD,
  DEDENNE,
  DRAGONITE,
  FLAREON,
  GALLADE,
  GLACEON,
  LEAFEON,
  MAGNEZONE,
  PIKACHU_CHRISTMAS,
  RAICHU,
  RAIKOU,
  SYLVEON,
  TOGEKISS
} from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S
} from '../../domain/subskill/subskills';
import {
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculatePityProcThreshold,
  calculateSkillPercentage,
  calculateSkillPercentageWithPityProc,
  extractIngredientSubskills,
  extractTriggerSubskills
} from '../../utils/stat-utils/stat-utils';
import { mockPokemon } from '../../vitest/mocks';

describe('calculateIngredientPercentage', () => {
  it('shall calculate ingredient percentage', () => {
    const result = calculateIngredientPercentage({
      pokemon: { ...mockPokemon(), ingredientPercentage: 20 },
      nature: MILD,
      subskills: new Set([INGREDIENT_FINDER_M.name, INGREDIENT_FINDER_S.name])
    });

    expect(result).toBe(0.3696);
  });
});

describe('calculateSkillPercentage', () => {
  it('shall calculate skill percentage', () => {
    const result = calculateSkillPercentage(
      SYLVEON.skillPercentage,
      new Set([SKILL_TRIGGER_M.name, SKILL_TRIGGER_S.name]),
      SASSY
    );

    expect(result).toBe(0.07392);
  });
});

describe('calculateSkillPercentageWithPityProc', () => {
  it('shall calculate skill percentage with subskills and nature', () => {
    const result = calculateSkillPercentageWithPityProc(
      SYLVEON,
      new Set([SKILL_TRIGGER_M.name, SKILL_TRIGGER_S.name]),
      SASSY
    );

    expect(result).toBe(0.07493626822619681);
  });

  it('shall calculate Raikou', () => {
    const result = calculateSkillPercentage(RAIKOU.skillPercentage, new Set(), BRAVE);
    expect(result).toMatchInlineSnapshot(`0.019`);
    const result2 = calculateSkillPercentageWithPityProc(RAIKOU, new Set(), BRAVE);
    expect(result2).toMatchInlineSnapshot(`0.0258916072626962`);
  });
});

describe('calculatePityProcThreshold', () => {
  it('shall calculate correct threshold for skill Pokemon', () => {
    expect(calculatePityProcThreshold(GALLADE)).toBe(60);
    expect(calculatePityProcThreshold(SYLVEON)).toBe(55);
    expect(calculatePityProcThreshold(DEDENNE)).toBe(57);
    expect(calculatePityProcThreshold(PIKACHU_CHRISTMAS)).toBe(57);
    expect(calculatePityProcThreshold(GLACEON)).toBe(45);
    expect(calculatePityProcThreshold(LEAFEON)).toBe(48);
    expect(calculatePityProcThreshold(TOGEKISS)).toBe(55);
    expect(calculatePityProcThreshold(MAGNEZONE)).toBe(46);
    expect(calculatePityProcThreshold(FLAREON)).toBe(53);
    expect(calculatePityProcThreshold(RAIKOU)).toBe(68);
  });

  it('shall calculate correct threshold for berry and ingredient pokemon', () => {
    expect(calculatePityProcThreshold(RAICHU)).toBe(78);
    expect(calculatePityProcThreshold(CATERPIE)).toBe(78);
    expect(calculatePityProcThreshold(CHARIZARD)).toBe(78);
    expect(calculatePityProcThreshold(DRAGONITE)).toBe(78);
    expect(calculatePityProcThreshold(ABSOL)).toBe(78);
  });
});

describe('extractIngredientSubskills', () => {
  it('shall calculate default ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set())).toBe(1);
  });
  it('shall calculate ingM+ingS ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set([INGREDIENT_FINDER_M.name, INGREDIENT_FINDER_S.name]))).toBe(1.54);
  });
  it('shall calculate ingM ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set([INGREDIENT_FINDER_M.name]))).toBe(1.36);
  });
  it('shall calculate ingS ing% from subskills', () => {
    expect(extractIngredientSubskills(new Set([INGREDIENT_FINDER_S.name]))).toBe(1.18);
  });
});

describe('extractTriggerSubskills', () => {
  it('shall calculate default trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set())).toBe(1);
  });
  it('shall calculate triggerM+triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set([SKILL_TRIGGER_M.name, SKILL_TRIGGER_S.name]))).toBe(1.54);
  });
  it('shall calculate triggerM trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set([SKILL_TRIGGER_M.name]))).toBe(1.36);
  });
  it('shall calculate triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills(new Set([SKILL_TRIGGER_S.name]))).toBe(1.18);
  });
});

describe('calculateNrOfBerriesPerDrop', () => {
  it('shall give 2 berries for berry specialty', () => {
    expect(calculateNrOfBerriesPerDrop('berry', new Set())).toBe(2);
  });

  it('shall give 3 berries for berry specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop('berry', new Set([BERRY_FINDING_S.name]))).toBe(3);
  });

  it('shall give 1 berry for ingredient specialty', () => {
    expect(calculateNrOfBerriesPerDrop('ingredient', new Set())).toBe(1);
  });

  it('shall give 2 berries for skill specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop('skill', new Set([BERRY_FINDING_S.name]))).toBe(2);
  });
});
