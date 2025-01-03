import { getMainskill, getMainskillNames } from '@src/utils/mainskill-utils/mainskill-utils.js';
import { describe, expect, it } from 'bun:test';
import type { Mainskill } from 'sleepapi-common';
import { MAINSKILLS } from 'sleepapi-common';

describe('getMainskillNames', () => {
  it('shall get all mainskill names', () => {
    expect(getMainskillNames()).toMatchInlineSnapshot(`
[
  "Berry Burst",
  "Charge Energy S",
  "Charge Strength M",
  "Charge Strength S",
  "Charge Strength S Range",
  "Cooking Power-up S",
  "Disguise (Berry Burst)",
  "Dream Shard Magnet S",
  "Dream Shard Magnet S Range",
  "Energizing Cheer S",
  "Energy For Everyone",
  "Extra Helpful S",
  "Helper Boost",
  "Ingredient Magnet S",
  "Metronome",
  "Moonlight (Charge Energy S)",
  "Skill Copy",
  "Mimic (Skill Copy)",
  "Transform (Skill Copy)",
  "Stockpile (Charge Strength S)",
  "Tasty Chance S",
]
`);
  });
});

describe('getMainskill', () => {
  it.each(MAINSKILLS.map((ms) => [ms.name, ms]))('finds mainskill %s', (name: string, ms: Mainskill) => {
    const result = getMainskill(name);
    expect(result).toEqual(ms);
  });

  it('shall throw if looking up missing mainskill', () => {
    expect(() => getMainskill('missing')).toThrowErrorMatchingInlineSnapshot(
      `"Can't find Main skill with name missing"`);
  });
});
