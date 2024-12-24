import { nature, pokemon, subskill } from 'sleepapi-common';
import { calculateFrequencyWithEnergy, calculateHelpSpeedBeforeEnergy } from './help-calculator';

describe('calculateHelpSpeedBeforeEnergy', () => {
  it('shall calculate help speed correctly', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      ribbonLevel: 0,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M],
      camp: false,
      helpingBonus: 0
    });

    expect(result).toBe(2268);
  });

  it('shall calculate camp correctly', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      ribbonLevel: 0,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M],
      camp: true,
      helpingBonus: 0
    });

    expect(result).toBe(2268 / 1.2);
  });

  it('shall clamp helping bonus correctly', () => {
    const result4hb = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      ribbonLevel: 0,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M, subskill.HELPING_SPEED_S],
      camp: false,
      helpingBonus: 4
    });
    const result5hb = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      ribbonLevel: 0,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M, subskill.HELPING_SPEED_S],
      camp: false,
      helpingBonus: 5
    });

    expect(result4hb).toBe(1714);
    expect(result5hb).toBe(1714);
  });

  it('shall skip ribbon frequency for last evolution stage mon', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.VICTREEBEL,
      level: 30,
      ribbonLevel: 4,
      nature: nature.RASH,
      subskills: [subskill.HELPING_SPEED_M],
      camp: false,
      helpingBonus: 0
    });

    expect(result).toBe(2268);
  });

  it('shall add 12% ribbon frequency to Onix at max ribbon', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.ONIX,
      level: 1,
      ribbonLevel: 4,
      nature: nature.BASHFUL,
      subskills: [],
      camp: false,
      helpingBonus: 0
    });

    expect(result).toBe(pokemon.ONIX.frequency * 0.88);
  });

  it('shall add 5% ribbon frequency to Onix at level 2 ribbon', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.ONIX,
      level: 1,
      ribbonLevel: 2,
      nature: nature.BASHFUL,
      subskills: [],
      camp: false,
      helpingBonus: 0
    });

    expect(result).toBe(pokemon.ONIX.frequency * 0.95);
  });

  it('shall add 11% ribbon frequency to Pichu at level 2 ribbon', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.PICHU,
      level: 1,
      ribbonLevel: 2,
      nature: nature.BASHFUL,
      subskills: [],
      camp: false,
      helpingBonus: 0
    });

    expect(result).toBe(pokemon.PICHU.frequency * 0.89);
  });

  it('shall add 25% ribbon frequency to Pichu at max ribbon', () => {
    const result = calculateHelpSpeedBeforeEnergy({
      pokemon: pokemon.PICHU,
      level: 1,
      ribbonLevel: 4,
      nature: nature.BASHFUL,
      subskills: [],
      camp: false,
      helpingBonus: 0
    });

    expect(result).toBe(pokemon.PICHU.frequency * 0.75);
  });
});

describe('calculateFrequencyWithEnergy', () => {
  it('shall factor in energy correctly', () => {
    expect(calculateFrequencyWithEnergy(100, 100)).toBe(45);
  });
});
