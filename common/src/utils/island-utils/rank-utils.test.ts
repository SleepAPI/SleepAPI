import { CYAN_EXPERT, GREENGRASS } from '../../types';
import { rankForStrength } from './rank-utils';

describe('rankForStrength', () => {
  it('uses the selected island thresholds', () => {
    expect(rankForStrength(100000, GREENGRASS)).toBe('Ultra 2');
  });

  it('uses the expert island thresholds', () => {
    expect(rankForStrength(3500000, CYAN_EXPERT)).toBe('Master 5');
  });
});
