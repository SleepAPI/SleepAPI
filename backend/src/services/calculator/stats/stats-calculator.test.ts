import { ADAMANT, MODEST, RASH } from '../../../domain/stat/nature';
import {
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
} from '../../../domain/stat/subskill';
import { calculateHelpSpeedSubskills, extractIngredientSubskills, invertNatureFrequecy } from './stats-calculator';

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
