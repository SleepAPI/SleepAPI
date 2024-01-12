import { ADAMANT, MODEST, RASH } from '../../../domain/stat/nature';
import {
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  INVENTORY_M,
  INVENTORY_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
} from '../../../domain/stat/subskill';
import {
  calculateHelpSpeedSubskills,
  extractIngredientSubskills,
  extractInventorySubskills,
  extractTriggerSubskills,
  getOptimalIngredientStats,
  invertNatureFrequecy,
  subskillsForFilter,
} from './stats-calculator';

describe('convertNatureToNegative', () => {
  it('shall default to 1 for neutral frequency nature', () => {
    expect(invertNatureFrequecy(RASH)).toBe(1);
  });
  it('shall invert ADAMANT to 0.9', () => {
    expect(invertNatureFrequecy(ADAMANT)).toBe(0.9);
  });
  it('shall invert MODEST to 1.1', () => {
    expect(invertNatureFrequecy(MODEST)).toBe(1.1);
  });
});

describe('calculateHelpSpeedSubskills', () => {
  it('shall calculate default helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([], 0)).toBe(1);
  });
  it('shall calculate helpM+helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([HELPING_SPEED_M, HELPING_SPEED_S], 0)).toBe(0.79);
  });
  it('shall calculate helpM helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([HELPING_SPEED_M], 0)).toBe(0.86);
  });
  it('shall calculate helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([HELPING_SPEED_S], 0)).toBe(0.93);
  });
  it('shall calculate and clamp helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([HELPING_SPEED_S, HELPING_SPEED_M], 3)).toBe(0.65);
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

describe('extractInventorySubskills', () => {
  it('shall calculate default inventory factor from subskills', () => {
    expect(extractInventorySubskills([])).toBe(0);
  });
  it('shall calculate invS+invM+invL inventory factor from subskills', () => {
    expect(extractInventorySubskills([INVENTORY_S, INVENTORY_M, INVENTORY_L])).toBe(36);
  });
  it('shall calculate invM+invL inventory factor from subskills', () => {
    expect(extractInventorySubskills([INVENTORY_M, INVENTORY_L])).toBe(30);
  });
  it('shall calculate invS inventory factor from subskills', () => {
    expect(extractInventorySubskills([INVENTORY_S])).toBe(6);
  });
});

describe('subskillsForFilter', () => {
  it('shall return an empty array for "neutral" subskillSet', () => {
    expect(subskillsForFilter('neutral', 10)).toEqual([]);
  });

  it('shall return empty subskills for level < 10', () => {
    expect(subskillsForFilter('optimal', 5)).toEqual([]);
  });

  it('shall return [INGREDIENT_FINDER_M] for level >= 10', () => {
    expect(subskillsForFilter('optimal', 10)).toEqual([INGREDIENT_FINDER_M]);
  });

  it('shall return [INGREDIENT_FINDER_M, HELPING_SPEED_M] for level >= 25', () => {
    expect(subskillsForFilter('optimal', 25)).toEqual([INGREDIENT_FINDER_M, HELPING_SPEED_M]);
  });

  it('shall return [INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L] for level >= 50', () => {
    expect(subskillsForFilter('optimal', 50)).toEqual([INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L]);
  });

  it('shall return [INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L, INGREDIENT_FINDER_S] for level >= 75', () => {
    expect(subskillsForFilter('optimal', 75)).toEqual([
      INGREDIENT_FINDER_M,
      HELPING_SPEED_M,
      INVENTORY_L,
      INGREDIENT_FINDER_S,
    ]);
  });

  it('shall return [INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L, INGREDIENT_FINDER_S, INVENTORY_M] for level >= 100', () => {
    expect(subskillsForFilter('optimal', 100)).toEqual([
      INGREDIENT_FINDER_M,
      HELPING_SPEED_M,
      INVENTORY_L,
      INGREDIENT_FINDER_S,
      INVENTORY_M,
    ]);
  });
});

describe('getOptimalIngredientStats', () => {
  it('shall return CustomStats with the provided level and nature RASH', () => {
    const level = 42;
    expect(getOptimalIngredientStats(level)).toEqual({
      level,
      nature: RASH,
      subskills: [INGREDIENT_FINDER_M, HELPING_SPEED_M],
    });
  });
});
