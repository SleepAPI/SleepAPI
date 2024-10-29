import { PokemonProduce } from '@src/domain/combination/produce';
import { MathUtils, berry, ingredient, mainskill, pokemon } from 'sleepapi-common';
import {
  calculateAverageNumberOfSkillProcsForHelps,
  calculateHelperBoostHelpsFromUnique,
  calculateHelpsToProcSchedule,
  calculateSkillProcs,
  scheduleSkillEvents,
} from './skill-calculator';

describe('calculateSkillProcs', () => {
  it('shall calculate skill percentage for Venusaur', () => {
    expect(calculateSkillProcs(46.5, 0.04158)).toBe(1.93347);
  });
});

describe('calculate procs from start', () => {
  it('shall calculate procs per day', () => {
    expect(calculateSkillProcs(100, 0.1)).toBe(10);
  });
});

describe('calculateAverageNumberOfSkillProcsForHelps', () => {
  describe('non-skill specialists', () => {
    it('shall return 0 for 0 helps regardless of skill percentage', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.5,
        helps: 0,
        pokemonSpecialty: 'berry',
      });
      expect(odds).toBe(0);
    });

    it('shall return 1 for 100% skill percentage regardless of helps', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 1,
        helps: 5,
        pokemonSpecialty: 'berry',
      });
      expect(odds).toBe(1);
    });

    it('shall calculate correct odds for given skill percentage and helps', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.25,
        helps: 4,
        pokemonSpecialty: 'berry',
      });
      const expectedOdds = 1 - Math.pow(0.75, 4);
      expect(odds).toBeCloseTo(expectedOdds);
    });

    it('shall return 0 for 0% skill percentage regardless of helps', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0,
        helps: 5,
        pokemonSpecialty: 'berry',
      });
      expect(odds).toBe(0);
    });

    it('shall return values between 0 and 1 for non-edge cases', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.5,
        helps: 3,
        pokemonSpecialty: 'berry',
      });
      expect(odds).toBeGreaterThan(0);
      expect(odds).toBeLessThan(1);
    });

    it('shall handle large numbers of helps correctly', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.1,
        helps: 50,
        pokemonSpecialty: 'berry',
      });
      expect(odds).toBeGreaterThan(0);
      expect(odds).toBeLessThan(1);
    });
  });

  describe('skill specialists', () => {
    it('shall return 0 for 0 helps regardless of skill percentage', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.5,
        helps: 0,
        pokemonSpecialty: 'skill',
      });
      expect(odds).toBe(0);
    });

    it('shall return 2 for 100% skill percentage regardless of helps', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 1,
        helps: 5,
        pokemonSpecialty: 'skill',
      });
      expect(odds).toBe(2);
    });

    it('shall calculate correct odds for given skill percentage and helps', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.25,
        helps: 4,
        pokemonSpecialty: 'skill',
      });
      const oddsZero = Math.pow(0.75, 4);
      const oddsOne = Math.pow(0.75, 3) * 0.25 * 4;
      const oddsTwo = 1 - oddsZero - oddsOne;
      const expectedOdds = oddsOne + 2 * oddsTwo;
      expect(odds).toBeCloseTo(expectedOdds);
    });

    it('shall calculate odds above 1 for realistic high skill percentage mons', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.25,
        helps: 10,
        pokemonSpecialty: 'skill',
      });
      const oddsZero = Math.pow(0.75, 10);
      const oddsOne = Math.pow(0.75, 9) * 0.25 * 10;
      const oddsTwo = 1 - oddsZero - oddsOne;
      const expectedOdds = oddsOne + 2 * oddsTwo;
      expect(odds).toBeCloseTo(expectedOdds);
    });

    it('shall return 0 for 0% skill percentage regardless of helps', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0,
        helps: 5,
        pokemonSpecialty: 'skill',
      });
      expect(odds).toBe(0);
    });

    it('shall return values between 0 and 2 for non-edge cases', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.5,
        helps: 3,
        pokemonSpecialty: 'skill',
      });
      expect(odds).toBeGreaterThan(0);
      expect(odds).toBeLessThan(2);
    });

    it('shall handle large numbers of helps correctly', () => {
      const odds = calculateAverageNumberOfSkillProcsForHelps({
        skillPercentage: 0.1,
        helps: 50,
        pokemonSpecialty: 'skill',
      });
      expect(odds).toBeGreaterThan(0);
      expect(odds).toBeLessThan(2);
    });
  });
});

describe('scheduleSkillEvents', () => {
  it('shall schedule skill events correctly for typical values', () => {
    const params = {
      skillLevel: 6,
      pokemonWithAverageProduce,
      oddsOfNightSkillProc: 0.5,
      nrOfDaySkillProcs: 3.1,
      nrOfDayHelps: 9,
      uniqueHelperBoost: 0,
    };
    const skillActivations = scheduleSkillEvents(params);

    expect(skillActivations.length).toBe(5);
    expect(skillActivations[0].adjustedAmount).toBe(1033); // Nightly proc
    expect(skillActivations[0].fractionOfProc).toBe(0.5); // Nightly proc

    expect(skillActivations[1].adjustedAmount).toBe(2066); // First day proc
    expect(skillActivations[2].adjustedAmount).toBe(2066); // Second day proc
    expect(skillActivations[3].adjustedAmount).toBe(2066); // Third day proc

    expect(Math.round(skillActivations[4].adjustedAmount)).toBe(207); // Final partial proc
    expect(MathUtils.round(skillActivations[4].fractionOfProc, 1)).toBe(0.1); // Final partial proc
  });

  it('shall handle zero day helps correctly', () => {
    const params = {
      skillLevel: 6,
      pokemonWithAverageProduce,
      oddsOfNightSkillProc: 0.3,
      nrOfDaySkillProcs: 0,
      nrOfDayHelps: 0,
      uniqueHelperBoost: 0,
    };
    const skillActivations = scheduleSkillEvents(params);

    expect(skillActivations.length).toBe(2); // Nightly activation and final partial proc
    expect(skillActivations[0]).toMatchInlineSnapshot(`
      {
        "adjustedAmount": 619.8,
        "fractionOfProc": 0.3,
        "nrOfHelpsToActivate": 0,
        "skill": {
          "RP": [
            400,
            569,
            785,
            1083,
            1496,
            2066,
            2656,
          ],
          "amount": [
            400,
            569,
            785,
            1083,
            1496,
            2066,
            3002,
          ],
          "description": "Increases Snorlax's Strength by ?.",
          "maxLevel": 7,
          "name": "Charge Strength S",
          "unit": "strength",
        },
      }
    `); // Nightly proc
    expect(skillActivations[1]).toMatchInlineSnapshot(`
      {
        "adjustedAmount": 0,
        "fractionOfProc": 0,
        "nrOfHelpsToActivate": 0,
        "skill": {
          "RP": [
            400,
            569,
            785,
            1083,
            1496,
            2066,
            2656,
          ],
          "amount": [
            400,
            569,
            785,
            1083,
            1496,
            2066,
            3002,
          ],
          "description": "Increases Snorlax's Strength by ?.",
          "maxLevel": 7,
          "name": "Charge Strength S",
          "unit": "strength",
        },
      }
    `); // Final partial proc, no helps during the day
  });

  it('shall handle more helps than procs', () => {
    const params = {
      skillLevel: 6,
      pokemonWithAverageProduce,
      oddsOfNightSkillProc: 0.4,
      nrOfDaySkillProcs: 2,
      nrOfDayHelps: 10,
      uniqueHelperBoost: 0,
    };
    const skillActivations = scheduleSkillEvents(params);

    expect(skillActivations.length).toBe(4); // Including nightly and final partial procs
    // Nightly proc
    expect(skillActivations[0]).toEqual({
      adjustedAmount: 826.4000000000001,
      fractionOfProc: 0.4,
      nrOfHelpsToActivate: 0,
      skill: mainskill.CHARGE_STRENGTH_S,
    });
    // Final partial proc
    expect(skillActivations[skillActivations.length - 1]).toEqual({
      adjustedAmount: 0,
      fractionOfProc: 0,
      nrOfHelpsToActivate: 10,
      skill: mainskill.CHARGE_STRENGTH_S,
    });
  });
});

const pokemonWithAverageProduce: PokemonProduce = {
  pokemon: pokemon.PINSIR,
  produce: {
    berries: [{ berry: berry.BELUE, amount: 10, level: 60 }],
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 20 }],
  },
};

describe('calculateHelpsToProcSchedule', () => {
  it('shall schedule skill procs after x helps for full day', () => {
    const result = calculateHelpsToProcSchedule({
      oddsOfNightSkillProc: 1,
      nrOfDaySkillProcs: 9.5,
      nrOfDayHelps: 21.85,
    });

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 0,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 2,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 4,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 6,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 9,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 11,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 13,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 16,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 18,
        },
        {
          "adjustedAmount": 1,
          "nrOfHelpsToActivate": 20,
        },
        {
          "adjustedAmount": 0.5,
          "nrOfHelpsToActivate": 21,
        },
      ]
    `);
  });
});

describe('calculateHelperBoostHelpsFromUnique', () => {
  it('shall return 0 for just Raikou', () => {
    expect(calculateHelperBoostHelpsFromUnique(1, 1)).toBe(0);
    expect(calculateHelperBoostHelpsFromUnique(1, 2)).toBe(0);
    expect(calculateHelperBoostHelpsFromUnique(1, 3)).toBe(0);
    expect(calculateHelperBoostHelpsFromUnique(1, 4)).toBe(0);
    expect(calculateHelperBoostHelpsFromUnique(1, 5)).toBe(0);
    expect(calculateHelperBoostHelpsFromUnique(1, 6)).toBe(0);
  });

  it('shall return 6 for 5 unique and 5+ skill level', () => {
    expect(calculateHelperBoostHelpsFromUnique(5, 5)).toBe(6);
    expect(calculateHelperBoostHelpsFromUnique(5, 6)).toBe(6);
  });

  it('shall return 2 for 3 unique and 3 skill level', () => {
    expect(calculateHelperBoostHelpsFromUnique(3, 3)).toBe(2);
  });

  it('shall throw if level is not between 1 and 6', () => {
    expect(() => calculateHelperBoostHelpsFromUnique(0, 0)).toThrowErrorMatchingInlineSnapshot(
      `"Invalid input: unique should be between 1 and 5, level should be between 1 and 6"`
    );
    expect(() => calculateHelperBoostHelpsFromUnique(0, 7)).toThrowErrorMatchingInlineSnapshot(
      `"Invalid input: unique should be between 1 and 5, level should be between 1 and 6"`
    );
  });

  it('shall throw if unique mons is not between 1 and 5', () => {
    expect(() => calculateHelperBoostHelpsFromUnique(0, 0)).toThrowErrorMatchingInlineSnapshot(
      `"Invalid input: unique should be between 1 and 5, level should be between 1 and 6"`
    );
    expect(() => calculateHelperBoostHelpsFromUnique(0, 6)).toThrowErrorMatchingInlineSnapshot(
      `"Invalid input: unique should be between 1 and 5, level should be between 1 and 6"`
    );
  });
});
