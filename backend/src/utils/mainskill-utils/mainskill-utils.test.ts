import { Mainskill, MAINSKILLS } from 'sleepapi-common';
import { getMainskill, getMainskillNames } from './mainskill-utils.js';

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
      `[MainskillError: Can't find Main skill with name missing]`
    );
  });
});
