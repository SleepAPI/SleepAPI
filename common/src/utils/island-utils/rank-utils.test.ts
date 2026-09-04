import { CYAN_EXPERT, GREENGRASS } from '../../types';
import { rankForProjectedStrength } from './rank-utils';

describe('rankForProjectedStrength', () => {
  it('uses the selected island thresholds', () => {
    expect(rankForProjectedStrength(100000, GREENGRASS)).toBe('Ultra 2');
  });

  it('uses the expert island thresholds', () => {
    expect(rankForProjectedStrength(3500000, CYAN_EXPERT)).toBe('Master 5');
  });
});
