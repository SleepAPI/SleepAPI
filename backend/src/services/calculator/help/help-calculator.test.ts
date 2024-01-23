import { VICTREEBEL } from '../../../domain/pokemon/ingredient-pokemon';
import { RASH } from '../../../domain/stat/nature';
import { HELPING_SPEED_M } from '../../../domain/stat/subskill';
import { calculateHelpSpeed } from './help-calculator';

describe('calculateHelpSpeed', () => {
  it('shall calculate help speed correctly for optimal situation', () => {
    const result = calculateHelpSpeed({
      pokemon: VICTREEBEL,
      customStats: { level: 30, nature: RASH, subskills: [HELPING_SPEED_M] },
      energyPeriod: 'CUSTOM',
      goodCamp: false,
      nrOfHelpingBonus: 0,
      e4eProcs: 10,
    });

    expect(result).toBe(1020);
  });
});
