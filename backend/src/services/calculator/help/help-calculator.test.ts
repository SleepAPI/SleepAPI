import { nature, pokemon, subskill } from 'sleepapi-common';
import { calculateFrequencyWithEnergy, calculateHelpSpeedBeforeEnergy } from './help-calculator';

describe('calculateHelpSpeedBeforeEnergy', () => {
  it('shall calculate help speed correctly', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M],
      camp: false,
      helpingBonus: 0,
    });

    expect(result).toBe(2268);
  });

  it('shall calculate camp correctly', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M],
      camp: true,
      helpingBonus: 0,
    });

    expect(result).toBe(2268 / 1.2);
  });

  it('shall clamp helping bonus correctly', () => {
    const result4hb = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M, subskill.HELPING_SPEED_S],
      camp: false,
      helpingBonus: 4,
    });
    const result5hb = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M, subskill.HELPING_SPEED_S],
      camp: false,
      helpingBonus: 5,
    });

    expect(result4hb).toBe(1714);
    expect(result5hb).toBe(1714);
  });
});

describe('calculateFrequencyWithEnergy', () => {
  it('shall factor in energy correctly', () => {
    expect(calculateFrequencyWithEnergy(100, 100)).toBe(45);
  });
});
