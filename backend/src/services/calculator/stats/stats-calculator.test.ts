import { nature, pokemon, subskill } from 'sleepapi-common';
import {
  calculateHelpSpeedSubskills,
  calculateSubskillCarrySize,
  countErbUsers,
  getOptimalStats,
} from './stats-calculator';

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
  it('shall calculate and clamp helping bonus if user and team exceeds 5', () => {
    expect(calculateHelpSpeedSubskills([subskill.HELPING_BONUS], 5)).toBe(0.75);
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
  it('shall return CustomStats for ingredient mon', () => {
    const level = 42;
    expect(getOptimalStats(level, pokemon.BLASTOISE)).toEqual({
      level,
      nature: nature.QUIET,
      subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M],
      skillLevel: 6,
      maxCarrySize: pokemon.BLASTOISE.maxCarrySize,
    });
  });

  it('shall return CustomStats for skill support mon', () => {
    const level = 42;
    expect(getOptimalStats(level, pokemon.SYLVEON)).toEqual({
      level,
      nature: nature.SASSY,
      subskills: [subskill.SKILL_TRIGGER_M, subskill.HELPING_SPEED_M],
      skillLevel: 6,
      maxCarrySize: pokemon.SYLVEON.maxCarrySize,
    });
  });
});

describe('countErbUsers', () => {
  it('shall clamp to 5 when user adds erb to both own and 5 members', () => {
    expect(countErbUsers(5, [subskill.ENERGY_RECOVERY_BONUS])).toBe(5);
  });

  it('shall clamp to 0 when team erb is negative', () => {
    expect(countErbUsers(-1, [])).toBe(0);
  });

  it('shall add user erb and team members erb', () => {
    expect(countErbUsers(2, [subskill.ENERGY_RECOVERY_BONUS])).toBe(3);
  });
});
