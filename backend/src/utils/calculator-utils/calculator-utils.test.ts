import { roundDown, splitNumber } from './calculator-utils';

describe('roundDown', () => {
  it('shall round to one decimal', () => {
    expect(roundDown(1.1111, 1)).toBe(1.1);
  });

  it('shall calculate and round to two decimals', () => {
    expect(roundDown(1.567, 2)).toBe(1.57);
  });

  it('shall calculate and round to four decimals', () => {
    expect(roundDown(1.23456, 4)).toBe(1.2346);
  });

  it('shall calculate and round to 1 decimal negative', () => {
    expect(roundDown(-0.26, 1)).toBe(-0.3);
  });
});

describe('splitNumber', () => {
  it('shall split decimal number into whole number array with ending decimal', () => {
    expect(splitNumber(4.2069)).toEqual([1, 1, 1, 1, 0.2069]);
  });
});
