import { describe, expect, it } from 'bun:test';
import { subskill } from 'sleepapi-common';
import { calculateHelpSpeedSubskills, calculateSubskillCarrySize, countErbUsers } from './stats-calculator.js';

describe('calculateHelpSpeedSubskills', () => {
  it('shall calculate default helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills(new Set(), 0)).toBe(1);
  });
  it('shall calculate helpM+helpS helpSpeed factor from subskills', () => {
    expect(
      calculateHelpSpeedSubskills(new Set([subskill.HELPING_SPEED_M.name, subskill.HELPING_SPEED_S.name]), 0)
    ).toBe(0.79);
  });
  it('shall calculate helpM helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills(new Set([subskill.HELPING_SPEED_M.name]), 0)).toBe(0.86);
  });
  it('shall calculate helpS helpSpeed factor from subskills', () => {
    expect(calculateHelpSpeedSubskills(new Set([subskill.HELPING_SPEED_S.name]), 0)).toBe(0.93);
  });
  it('shall calculate and clamp helpS helpSpeed factor from subskills', () => {
    expect(
      calculateHelpSpeedSubskills(new Set([subskill.HELPING_SPEED_S.name, subskill.HELPING_SPEED_M.name]), 3)
    ).toBe(0.65);
  });
  it('shall calculate and clamp helping bonus if user and team exceeds 5', () => {
    expect(calculateHelpSpeedSubskills(new Set([subskill.HELPING_BONUS.name]), 5)).toBe(0.75);
  });
});

describe('extractInventorySubskills', () => {
  it('shall calculate default inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize(new Set())).toBe(0);
  });
  it('shall calculate invS+invM+invL inventory factor from subskills', () => {
    expect(
      calculateSubskillCarrySize(
        new Set([subskill.INVENTORY_S.name, subskill.INVENTORY_M.name, subskill.INVENTORY_L.name])
      )
    ).toBe(36);
  });
  it('shall calculate invM+invL inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize(new Set([subskill.INVENTORY_M.name, subskill.INVENTORY_L.name]))).toBe(30);
  });
  it('shall calculate invS inventory factor from subskills', () => {
    expect(calculateSubskillCarrySize(new Set([subskill.INVENTORY_S.name]))).toBe(6);
  });
});

describe('countErbUsers', () => {
  it('shall clamp to 5 when user adds erb to both own and 5 members', () => {
    expect(countErbUsers(5, new Set([subskill.ENERGY_RECOVERY_BONUS.name]))).toBe(5);
  });

  it('shall clamp to 0 when team erb is negative', () => {
    expect(countErbUsers(-1, new Set())).toBe(0);
  });

  it('shall add user erb and team members erb', () => {
    expect(countErbUsers(2, new Set([subskill.ENERGY_RECOVERY_BONUS.name]))).toBe(3);
  });
});
