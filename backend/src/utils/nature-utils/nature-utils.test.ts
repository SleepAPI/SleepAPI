import { NatureError } from '@src/domain/error/stat/stat-error';
import { nature } from 'sleepapi-common';
import { getNature, getNatureNames } from './nature-utils';

describe('getNature', () => {
  it('shall return RASH for RaSh name', () => {
    expect(getNature('RaSh')).toBe(nature.RASH);
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
