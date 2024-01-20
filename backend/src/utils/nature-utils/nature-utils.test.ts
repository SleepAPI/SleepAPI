import { NatureError } from '../../domain/error/stat/stat-error';
import { RASH } from '../../domain/stat/nature';
import { getNature } from './nature-utils';

describe('getNature', () => {
  it('shall return RASH for RaSh name', () => {
    expect(getNature('RaSh')).toBe(RASH);
  });

  it("shall throw if Nature can't be found", () => {
    expect(() => getNature('missing')).toThrow(NatureError);
  });
});
