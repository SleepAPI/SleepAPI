import { describe, expect, it } from 'vitest';
import { MILD, SASSY } from '../../domain/nature';
import { DRAGONITE, GALLADE, MOCK_POKEMON, RAICHU } from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
} from '../../domain/subskill';
import {
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage,
  extractIngredientSubskills,
  extractTriggerSubskills,
} from '../../utils/stat-utils/stat-utils';

describe('calculateIngredientPercentage', () => {
  it('shall calculate ingredient percentage', () => {
    const result = calculateIngredientPercentage({
      pokemon: { ...MOCK_POKEMON, ingredientPercentage: 20 },
      nature: MILD,
      subskills: [INGREDIENT_FINDER_M, INGREDIENT_FINDER_S],
    });

    expect(result).toBe(0.3696);
  });
});

describe('calculateSkillPercentage', () => {
  it('shall calculate ingredient percentage', () => {
    const result = calculateSkillPercentage(
      { ...MOCK_POKEMON, skillPercentage: 2 },
      [SKILL_TRIGGER_M, SKILL_TRIGGER_S],
      SASSY,
    );

    expect(result).toBe(0.03696);
  });
});

describe('extractIngredientSubskills', () => {
  it('shall calculate default ing% from subskills', () => {
    expect(extractIngredientSubskills([])).toBe(1);
  });
  it('shall calculate ingM+ingS ing% from subskills', () => {
    expect(extractIngredientSubskills([INGREDIENT_FINDER_M, INGREDIENT_FINDER_S])).toBe(1.54);
  });
  it('shall calculate ingM ing% from subskills', () => {
    expect(extractIngredientSubskills([INGREDIENT_FINDER_M])).toBe(1.36);
  });
  it('shall calculate ingS ing% from subskills', () => {
    expect(extractIngredientSubskills([INGREDIENT_FINDER_S])).toBe(1.18);
  });
});

describe('extractTriggerSubskills', () => {
  it('shall calculate default trigger factor from subskills', () => {
    expect(extractTriggerSubskills([])).toBe(1);
  });
  it('shall calculate triggerM+triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills([SKILL_TRIGGER_M, SKILL_TRIGGER_S])).toBe(1.54);
  });
  it('shall calculate triggerM trigger factor from subskills', () => {
    expect(extractTriggerSubskills([SKILL_TRIGGER_M])).toBe(1.36);
  });
  it('shall calculate triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills([SKILL_TRIGGER_S])).toBe(1.18);
  });
});

describe('calculateNrOfBerriesPerDrop', () => {
  it('shall give 2 berries for berry specialty', () => {
    expect(calculateNrOfBerriesPerDrop(RAICHU, [])).toBe(2);
  });

  it('shall give 3 berries for berry specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop(RAICHU, [BERRY_FINDING_S])).toBe(3);
  });

  it('shall give 1 berry for ingredient specialty', () => {
    expect(calculateNrOfBerriesPerDrop(DRAGONITE, [])).toBe(1);
  });

  it('shall give 2 berries for skill specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop(GALLADE, [BERRY_FINDING_S])).toBe(2);
  });
});
