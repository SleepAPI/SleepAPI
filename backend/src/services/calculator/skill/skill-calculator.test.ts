import { nature, pokemon, subskill } from 'sleepapi-common';
import { calculateHelpSpeed } from '../help/help-calculator';
import { calculateSkillPercentage, calculateSkillProcs } from './skill-calculator';

describe('calculateSkillPercentage', () => {
  it('shall calculate skill percentage for Venusaur', () => {
    expect(
      calculateSkillPercentage(pokemon.VENUSAUR, [subskill.SKILL_TRIGGER_M, subskill.SKILL_TRIGGER_S], nature.SASSY)
    ).toBe(0.038808);
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
    const pkmn = pokemon.SYLVEON;
    const subskills = [subskill.SKILL_TRIGGER_M, subskill.SKILL_TRIGGER_S];
    const nat = nature.CALM;

    const skillPercentage = calculateSkillPercentage(pkmn, subskills, nat);
    const nrOfHelps =
      (3600 /
        calculateHelpSpeed({
          pokemon: pkmn,
          customStats: { level: 29, nature: nat, subskills },
          energyPeriod: 'DAY',
          goodCamp: false,
          nrOfHelpingBonus: 0,
          e4eProcs: 4,
        })) *
      15.5;

    expect(calculateSkillProcs(nrOfHelps, skillPercentage)).toBe(5.300319736408567);
  });
});
