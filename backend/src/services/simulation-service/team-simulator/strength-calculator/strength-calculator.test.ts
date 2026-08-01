import { StrengthCalculator } from '@src/services/simulation-service/team-simulator/strength-calculator/strength-calculator.js';
import { mocks } from '@src/vitest/index.js';
import { berry, berryPowerForLevel, mainskillUnits, type MemberSkillValue } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('StrengthCalculator', () => {
  const calculator = new StrengthCalculator();

  it('shall calculate berry strength with favored and island bonuses', () => {
    const settings = mocks.teamSettings({
      island: mocks.islandInstance({
        berries: [berry.BELUE],
        areaBonus: 15
      })
    });

    const belueAmountWithoutSkill = 10;
    const cheriAmountWithoutSkill = 5;

    const result = calculator.calculateStrength({
      settings,
      produceWithoutSkill: {
        berries: [
          { berry: berry.BELUE, level: 60, amount: belueAmountWithoutSkill },
          { berry: berry.CHERI, level: 30, amount: cheriAmountWithoutSkill }
        ],
        ingredients: []
      },
      produceFromSkill: { berries: [], ingredients: [] },
      skillValue: emptySkillValue()
    });

    const belueBase = belueAmountWithoutSkill * berryPowerForLevel(berry.BELUE, 60);
    const belueFavored = belueBase; // favored berries have 2x multiplier
    const belueIsland = (belueBase + belueFavored) * 0.15;

    const cheriBase = cheriAmountWithoutSkill * berryPowerForLevel(berry.CHERI, 30);
    const cheriIsland = cheriBase * 0.15;

    expect(result.berries.breakdown).toEqual({
      base: belueBase + cheriBase,
      favored: belueFavored,
      islandBonus: belueIsland + cheriIsland
    });
    expect(result.berries.total).toBe(belueBase + belueFavored + belueIsland + cheriBase + cheriIsland);
    expect(result.skill.total).toBe(0);
  });

  it('shall calculate skill strength including skill berries and strength value', () => {
    const settings = mocks.teamSettings({
      island: mocks.islandInstance({
        berries: [berry.BELUE],
        areaBonus: 20
      })
    });

    const belueAmountFromSkill = 4;
    const pechaAmountFromSkill = 2;

    const result = calculator.calculateStrength({
      settings,
      produceWithoutSkill: { berries: [], ingredients: [] },
      produceFromSkill: {
        berries: [
          { berry: berry.BELUE, amount: belueAmountFromSkill, level: 60 },
          { berry: berry.PECHA, amount: pechaAmountFromSkill, level: 30 }
        ],
        ingredients: []
      },
      skillValue: (() => {
        const skillValues = emptySkillValue();
        skillValues.strength = { amountToSelf: 100, amountToTeam: 50 };
        return skillValues;
      })()
    });

    const belueBase = belueAmountFromSkill * berryPowerForLevel(berry.BELUE, 60);
    const belueFavored = belueBase;
    const belueIsland = (belueBase + belueFavored) * 0.2;

    const pechaBase = pechaAmountFromSkill * berryPowerForLevel(berry.PECHA, 30);
    const pechaIsland = pechaBase * 0.2;

    const skillBase = 150;
    const skillIsland = skillBase * 0.2;

    expect(result.berries.total).toBe(0);
    expect(result.skill.breakdown.base).toBe(belueBase + belueFavored + pechaBase + skillBase);
    expect(result.skill.breakdown.islandBonus).toBe(belueIsland + pechaIsland + skillIsland);
    expect(result.skill.total).toBe(
      belueBase + belueFavored + pechaBase + skillBase + belueIsland + pechaIsland + skillIsland
    );
  });

  it('shall apply the expert mode berry bonus to helper and skill berries and compound with area bonus', () => {
    const settings = mocks.teamSettings({
      island: mocks.islandInstance({
        expert: true,
        berries: [berry.BELUE],
        areaBonus: 50,
        expertMode: {
          mainFavoriteBerry: berry.BELUE,
          subFavoriteBerries: [],
          randomBonus: 'berry'
        }
      })
    });

    const belueAmountWithoutSkill = 10;
    const cheriAmountWithoutSkill = 5;
    const belueAmountFromSkill = 4;

    const result = calculator.calculateStrength({
      settings,
      produceWithoutSkill: {
        berries: [
          { berry: berry.BELUE, amount: belueAmountWithoutSkill, level: 60 },
          { berry: berry.CHERI, amount: cheriAmountWithoutSkill, level: 30 }
        ],
        ingredients: []
      },
      produceFromSkill: {
        berries: [{ berry: berry.BELUE, amount: belueAmountFromSkill, level: 60 }],
        ingredients: []
      },
      skillValue: emptySkillValue()
    });

    const belueBase = belueAmountWithoutSkill * berryPowerForLevel(berry.BELUE, 60);
    const belueFavored = belueBase * 1.4; // 2.4x total instead of 2x
    const belueIsland = (belueBase + belueFavored) * 0.5;

    const cheriBase = cheriAmountWithoutSkill * berryPowerForLevel(berry.CHERI, 30);
    const cheriIsland = cheriBase * 0.5;

    expect(result.berries.breakdown).toEqual({
      base: belueBase + cheriBase,
      favored: belueFavored,
      islandBonus: belueIsland + cheriIsland
    });
    expect(result.berries.total).toBeCloseTo(belueBase * 2.4 * 1.5 + cheriBase * 1.5);

    const skillBerryBase = belueAmountFromSkill * berryPowerForLevel(berry.BELUE, 60);
    expect(result.skill.total).toBeCloseTo(skillBerryBase * 2.4 * 1.5);
  });

  it('shall fall back to settings area bonus when not provided', () => {
    const settings = mocks.teamSettings({
      island: mocks.islandInstance({
        berries: [berry.BELUE],
        areaBonus: 10
      })
    });

    const result = calculator.calculateStrength({
      settings,
      produceWithoutSkill: {
        berries: [{ berry: berry.BELUE, amount: 1, level: 1 }],
        ingredients: []
      },
      produceFromSkill: { berries: [], ingredients: [] },
      skillValue: emptySkillValue()
    });

    const base = berryPowerForLevel(berry.BELUE, 1);
    const favored = base;
    const island = (base + favored) * 0.1;

    expect(result.berries.total).toBe(base + favored + island);
  });
});

function emptySkillValue(): MemberSkillValue {
  const value = {} as MemberSkillValue;
  for (const unit of mainskillUnits) {
    value[unit] = { amountToSelf: 0, amountToTeam: 0 };
  }
  return value;
}
