import { NatureError } from '../../domain/error/stat/stat-error';
import { RASH } from '../../domain/stat/nature';
import { getNature, getNatureNames } from './nature-utils';

describe('getNature', () => {
  it('shall return RASH for RaSh name', () => {
    expect(getNature('RaSh')).toBe(RASH);
  });

  it("shall throw if Nature can't be found", () => {
    expect(() => getNature('missing')).toThrow(NatureError);
  });
});

describe('getNatureNames', () => {
  it('shall get all nature names', () => {
    expect(getNatureNames()).toMatchInlineSnapshot(`
      [
        "Lonely",
        "Adamant",
        "Naughty",
        "Brave",
        "Bold",
        "Impish",
        "Lax",
        "Relaxed",
        "Modest",
        "Mild",
        "Rash",
        "Quiet",
        "Calm",
        "Gentle",
        "Careful",
        "Sassy",
        "Timid",
        "Hasty",
        "Jolly",
        "Naive",
        "Bashful",
        "Hardy",
        "Docile",
        "Quirky",
        "Serious",
      ]
    `);
  });
});
