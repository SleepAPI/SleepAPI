import { nature, pokemon, subskill } from 'sleepapi-common';
import { calculateHelpSpeed } from './help-calculator';

describe('calculateHelpSpeed', () => {
  it('shall calculate help speed correctly for optimal situation', () => {
    const result = calculateHelpSpeed({
      pokemon: pokemon.VICTREEBEL,
      customStats: { level: 30, nature: nature.RASH, subskills: [subskill.HELPING_SPEED_M] },
      energyPeriod: 'CUSTOM',
      goodCamp: false,
      nrOfHelpingBonus: 0,
      e4eProcs: 10,
    });

    expect(result).toBe(1020);
  });
});
