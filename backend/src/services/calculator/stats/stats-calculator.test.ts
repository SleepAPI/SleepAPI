import { nature, pokemon, subskill } from 'sleepapi-common';
import {
  calculateHelpSpeedSubskills,
  calculateSubskillCarrySize,
  extractIngredientSubskills,
  extractTriggerSubskills,
  getOptimalIngredientStats,
  invertNatureFrequecy,
} from './stats-calculator';

describe('convertNatureToNegative', () => {
  it('shall default to 1 for neutral frequency nature', () => {
    expect(invertNatureFrequecy(nature.RASH)).toBe(1);
  });
  it('shall invert ADAMANT to 0.9', () => {
    expect(invertNatureFrequecy(nature.ADAMANT)).toBe(0.9);
  });
  it('shall invert MODEST to 1.1', () => {
    expect(invertNatureFrequecy(nature.MODEST)).toBe(1.1);
  });
});

describe('calculateHelpSpeedSubskills', () => {
  it('shall calculate default helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([], 0)).toBe(1);
  });
  it('shall calculate helpM+helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([subskill.HELPING_SPEED_M, subskill.HELPING_SPEED_S], 0)).toBe(0.79);
  });
  it('shall calculate helpM helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([subskill.HELPING_SPEED_M], 0)).toBe(0.86);
  });
  it('shall calculate helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([subskill.HELPING_SPEED_S], 0)).toBe(0.93);
  });
  it('shall calculate and clamp helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills([subskill.HELPING_SPEED_S, subskill.HELPING_SPEED_M], 3)).toBe(0.65);
  });
});

describe('extractIngredientSubskills', () => {
  it('shall calculate default ing% from subskills', () => {
    expect(extractIngredientSubskills([])).toBe(1);
  });
  it('shall calculate ingM+ingS ing% from subskills', () => {
    expect(extractIngredientSubskills([subskill.INGREDIENT_FINDER_M, subskill.INGREDIENT_FINDER_S])).toBe(1.54);
  });
  it('shall calculate ingM ing% from subskills', () => {
    expect(extractIngredientSubskills([subskill.INGREDIENT_FINDER_M])).toBe(1.36);
  });
  it('shall calculate ingS ing% from subskills', () => {
    expect(extractIngredientSubskills([subskill.INGREDIENT_FINDER_S])).toBe(1.18);
  });
});

describe('extractTriggerSubskills', () => {
  it('shall calculate default trigger factor from subskills', () => {
    expect(extractTriggerSubskills([])).toBe(1);
  });
  it('shall calculate triggerM+triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills([subskill.SKILL_TRIGGER_M, subskill.SKILL_TRIGGER_S])).toBe(1.54);
  });
  it('shall calculate triggerM trigger factor from subskills', () => {
    expect(extractTriggerSubskills([subskill.SKILL_TRIGGER_M])).toBe(1.36);
  });
  it('shall calculate triggerS trigger factor from subskills', () => {
    expect(extractTriggerSubskills([subskill.SKILL_TRIGGER_S])).toBe(1.18);
  });
});

describe('extractInventorySubskills', () => {
  it('shall calculate default inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize([])).toBe(0);
  });
  it('shall calculate invS+invM+invL inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize([subskill.INVENTORY_S, subskill.INVENTORY_M, subskill.INVENTORY_L])).toBe(36);
  });
  it('shall calculate invM+invL inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize([subskill.INVENTORY_M, subskill.INVENTORY_L])).toBe(30);
  });
  it('shall calculate invS inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize([subskill.INVENTORY_S])).toBe(6);
  });
});

describe('getOptimalIngredientStats', () => {
  it('shall return CustomStats with the provided level and nature RASH', () => {
    const level = 42;
    expect(getOptimalIngredientStats(level, pokemon.BLASTOISE)).toEqual({
      level,
      nature: nature.QUIET,
      subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M],
    });
  });
});
