import { VENUSAUR } from '../../../domain/pokemon/ingredient-pokemon';
import { SYLVEON } from '../../../domain/pokemon/skill-pokemon';
import { CALM, SASSY } from '../../../domain/stat/nature';
import { SKILL_TRIGGER_M, SKILL_TRIGGER_S } from '../../../domain/stat/subskill';
import { calculateHelpSpeed } from '../help/help-calculator';
import { calculateSkillPercentage, calculateSkillProcs } from './skill-calculator';

describe('calculateSkillPercentage', () => {
  it('shall calculate skill percentage for Venusaur', () => {
    expect(calculateSkillPercentage(VENUSAUR, [SKILL_TRIGGER_M, SKILL_TRIGGER_S], SASSY)).toBe(0.04158);
  });
});

describe('calculateSkillProcs', () => {
  it('shall calculate skill percentage for Venusaur', () => {
    expect(calculateSkillProcs(46.5, 0.04158)).toBe(1.93347);
  });
});

describe('calculate procs from start', () => {
  // this can be used for testing mons for now
  it.skip('shall calculate procs per day for my Sylveon', () => {
    const pokemon = SYLVEON;
    const subskills = [SKILL_TRIGGER_M, SKILL_TRIGGER_S];
    const nature = CALM;

    const skillPercentage = calculateSkillPercentage(pokemon, subskills, nature);
    const nrOfHelps =
      (3600 /
        calculateHelpSpeed({
          pokemon,
          customStats: { level: 29, nature, subskills },
          energyPeriod: 'DAY',
          goodCamp: false,
          nrOfHelpingBonus: 0,
          e4eProcs: 4,
        })) *
      15.5;

    expect(calculateSkillProcs(nrOfHelps, skillPercentage)).toBe(5.300319736408567);
  });
});
