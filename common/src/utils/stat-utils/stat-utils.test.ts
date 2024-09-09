import { describe, expect, it } from 'vitest';
import { BRAVE, MILD, SASSY } from '../../domain/nature';
import { Pokemon } from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
} from '../../domain/subskill';
import { MOCK_POKEMON } from '../../mocks';
import {
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculatePityProcThreshold,
  calculateSkillPercentage,
  calculateSkillPercentageWithPityProc,
  extractIngredientSubskills,
  extractTriggerSubskills,
} from '../../utils/stat-utils/stat-utils';
import { toSeconds } from '../time-utils';

const mockSylveon: Pokemon = {
  ...MOCK_POKEMON,
  specialty: 'skill',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 17.8,
  skillPercentage: 4.0,
};
const mockRaikou: Pokemon = {
  ...MOCK_POKEMON,
  specialty: 'skill',
  frequency: toSeconds(0, 35, 0),
  ingredientPercentage: 19.2,
  skillPercentage: 1.9,
};
const mockBerrySpecialist: Pokemon = {
  ...MOCK_POKEMON,
  specialty: 'berry',
};
const mockIngredientSpecialist: Pokemon = {
  ...MOCK_POKEMON,
  specialty: 'ingredient',
  ingredientPercentage: 20,
};

describe('calculateIngredientPercentage', () => {
  it('shall calculate ingredient percentage', () => {
    const result = calculateIngredientPercentage({
      pokemon: mockIngredientSpecialist,
      nature: MILD,
      subskills: [INGREDIENT_FINDER_M, INGREDIENT_FINDER_S],
    });

    expect(result).toBe(0.3696);
  });
});

describe('calculateSkillPercentage', () => {
  it('shall calculate skill percentage', () => {
    const result = calculateSkillPercentage(mockSylveon.skillPercentage, [SKILL_TRIGGER_M, SKILL_TRIGGER_S], SASSY);

    expect(result).toBe(0.07392);
  });
});

describe('calculateSkillPercentageWithPityProc', () => {
  it('shall calculate skill percentage with subskills and nature', () => {
    const result = calculateSkillPercentageWithPityProc(mockSylveon, [SKILL_TRIGGER_M, SKILL_TRIGGER_S], SASSY);

    expect(result).toBe(0.07493626822619681);
  });

  it('shall calculate Raikou', () => {
    const result = calculateSkillPercentage(mockRaikou.skillPercentage, [], BRAVE);
    expect(result).toMatchInlineSnapshot(`0.019`);
    const result2 = calculateSkillPercentageWithPityProc(mockRaikou, [], BRAVE);
    expect(result2).toMatchInlineSnapshot(`0.0258916072626962`);
  });
});

describe('calculatePityProcThreshold', () => {
  it('shall calculate correct threshold for skill Pokemon', () => {
    expect(calculatePityProcThreshold(mockSylveon)).toBe(55);
    expect(calculatePityProcThreshold(mockRaikou)).toBe(68);
  });

  it('shall calculate correct threshold for berry and ingredient pokemon', () => {
    expect(calculatePityProcThreshold(mockBerrySpecialist)).toBe(78);
    expect(calculatePityProcThreshold(mockIngredientSpecialist)).toBe(78);
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
    expect(calculateNrOfBerriesPerDrop(mockBerrySpecialist, [])).toBe(2);
  });

  it('shall give 3 berries for berry specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop(mockBerrySpecialist, [BERRY_FINDING_S])).toBe(3);
  });

  it('shall give 1 berry for ingredient specialty', () => {
    expect(calculateNrOfBerriesPerDrop(mockIngredientSpecialist, [])).toBe(1);
  });

  it('shall give 2 berries for skill specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop(mockSylveon, [BERRY_FINDING_S])).toBe(2);
  });
});
