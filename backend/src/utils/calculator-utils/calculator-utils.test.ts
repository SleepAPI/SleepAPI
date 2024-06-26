import { splitNumber } from './calculator-utils';

describe('splitNumber', () => {
  it('shall split decimal number into whole number array with ending decimal', () => {
    expect(splitNumber(4.2069)).toEqual([1, 1, 1, 1, 0.2069]);
  });
});
