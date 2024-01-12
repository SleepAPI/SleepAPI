import { VICTREEBEL } from '../../../domain/pokemon/ingredient-pokemon';
import {
  calculateAsleepAverageEnergyCoefficient,
  calculateAverageNaturalDeclineEnergyCoefficient,
  calculateAwakeAverageEnergyCoefficient,
  calculateSpecificEnergyCoefficient,
} from './energy-calculator';

describe('calculateAwakeAverageEnergyCoefficient', () => {
  it('shall calculate average awake energy coeff no e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient()).toBe(0.594883997620464);
  });

  it('shall calculate average awake energy coeff 1 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(1)).toBe(0.5275374312633101);
  });

  it('shall calculate average awake energy coeff 2 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(2)).toBe(0.4917285012464102);
  });

  it('shall calculate average awake energy coeff 3 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(3)).toBe(0.4654973262032086);
  });

  it('shall calculate average awake energy coeff 4 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(4)).toBe(0.45065230896665975);
  });

  it('shall calculate average awake energy coeff 5 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(5)).toBe(0.45);
  });
});

describe('calculateAsleepAverageEnergyCoefficient', () => {
  it('shall calculate sleep coefficient no e4e for Victreebel', () => {
    expect(calculateAsleepAverageEnergyCoefficient(VICTREEBEL.frequency)).toBe(0.6013100436681224);
  });

  it('shall calculate sleep coefficient 1 e4e for Victreebel', () => {
    expect(calculateAsleepAverageEnergyCoefficient(VICTREEBEL.frequency, 1)).toBe(0.5405672896162778);
  });

  it('shall calculate sleep coefficient 2 e4e for Victreebel', () => {
    expect(calculateAsleepAverageEnergyCoefficient(VICTREEBEL.frequency, 2)).toBe(0.5145491803278688);
  });

  it('shall calculate sleep coefficient 3 e4e for Victreebel', () => {
    expect(calculateAsleepAverageEnergyCoefficient(VICTREEBEL.frequency, 3)).toBe(0.4795338869541923);
  });

  it('shall calculate sleep coefficient 4 e4e for Victreebel', () => {
    expect(calculateAsleepAverageEnergyCoefficient(VICTREEBEL.frequency, 4)).toBe(0.4795338869541923);
  });

  it('shall calculate sleep coefficient 5 e4e for Victreebel', () => {
    expect(calculateAsleepAverageEnergyCoefficient(VICTREEBEL.frequency, 5)).toBe(0.44999999999999996);
  });
});

describe('calculateAverageNaturalDeclineEnergyCoefficient', () => {
  it('shall calculate sleep energy factor', () => {
    expect(calculateAverageNaturalDeclineEnergyCoefficient(VICTREEBEL.frequency)).toBe(0.5970182256397216);
  });
});

describe('calculateEnergyDivisionCoefficient', () => {
  it('shall convert 150 energy percentage to division coeff', () => {
    expect(calculateSpecificEnergyCoefficient(150)).toBe(0.45);
  });
  it('shall convert 61 energy percentage to division coeff', () => {
    expect(calculateSpecificEnergyCoefficient(61)).toBe(0.52);
  });
  it('shall convert 60 energy percentage to division coeff', () => {
    expect(calculateSpecificEnergyCoefficient(60)).toBe(0.62);
  });
  it('shall convert 23 energy percentage to division coeff', () => {
    expect(calculateSpecificEnergyCoefficient(23)).toBe(0.71);
  });
  it('shall convert 0 energy percentage to division coeff', () => {
    expect(calculateSpecificEnergyCoefficient(0)).toBe(1);
  });
});
