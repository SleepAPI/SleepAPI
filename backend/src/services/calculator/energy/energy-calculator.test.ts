import { calculateAsleepAverageEnergyCoefficient, calculateAwakeAverageEnergyCoefficient } from './energy-calculator';

describe('calculateAwakeAverageEnergyCoefficient', () => {
  it('shall calculate average awake energy coeff no e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient()).toBe(0.5819300646788452);
  });

  it('shall calculate average awake energy coeff 1 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(1)).toBe(0.5233011452540883);
  });

  it('shall calculate average awake energy coeff 2 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(2)).toBe(0.48778551441400403);
  });

  it('shall calculate average awake energy coeff 3 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(3)).toBe(0.4627259196257708);
  });

  it('shall calculate average awake energy coeff 4 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(4)).toBe(0.44999999999999996);
  });

  it('shall calculate average awake energy coeff 5 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(5)).toBe(0.44999999999999996);
  });

  it('shall fallback average awake energy to 100% if >5 e4e', () => {
    expect(calculateAwakeAverageEnergyCoefficient(6)).toBe(0.45);
  });
});

describe('calculateAsleepAverageEnergyCoefficient', () => {
  it('shall calculate sleep coefficient no e4e', () => {
    expect(calculateAsleepAverageEnergyCoefficient()).toBe(1);
  });

  it('shall calculate sleep coefficient 1 e4e', () => {
    expect(calculateAsleepAverageEnergyCoefficient(1)).toBe(0.9057028514257128);
  });

  it('shall calculate sleep coefficient 2 e4e', () => {
    expect(calculateAsleepAverageEnergyCoefficient(2)).toBe(0.7884345236422893);
  });

  it('shall calculate sleep coefficient 3 e4e', () => {
    expect(calculateAsleepAverageEnergyCoefficient(3)).toBe(0.6626342114643665);
  });

  it('shall calculate sleep coefficient 4 e4e', () => {
    expect(calculateAsleepAverageEnergyCoefficient(4)).toBe(0.5806004070676277);
  });

  it('shall calculate sleep coefficient 5 e4e ', () => {
    expect(calculateAsleepAverageEnergyCoefficient(5)).toBe(0.5129273770900924);
  });

  it('shall fallback average nightly energy to 100% if >5 e4e', () => {
    expect(calculateAsleepAverageEnergyCoefficient(6)).toBe(0.44999999999999996);
  });
});
