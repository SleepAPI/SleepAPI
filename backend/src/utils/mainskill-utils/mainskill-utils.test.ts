import { mainskill } from 'sleepapi-common';
import { getMainskill, getMainskillNames } from './mainskill-utils';

describe('getMainskillNames', () => {
  it('shall get all subskill names', () => {
    expect(getMainskillNames()).toMatchInlineSnapshot(`
      [
        "Charge Energy S",
        "Energizing Cheer S",
        "Energy For Everyone",
        "Charge Strength M",
        "Charge Strength S",
        "Charge Strength S Range",
        "Dream Shard Magnet S",
        "Dream Shard Magnet S Range",
        "Extra Helpful S",
        "Helper Boost",
        "Cooking Power-up S",
        "Tasty Chance S",
        "Ingredient Magnet S",
        "Metronome",
        "Stockpile (Charge Strength S)",
      ]
    `);
  });
});

describe('getMainskill', () => {
  it.each(mainskill.MAINSKILLS)('finds mainskill "%s"', (ms: mainskill.MainSkill) => {
    const result = getMainskill(ms.name);
    expect(result).toEqual(ms);
  });

  it('shall throw if looking up missing mainskill', () => {
    expect(() => getMainskill('missing')).toThrowErrorMatchingInlineSnapshot(
      `"Can't find Main skill with name missing"`
    );
  });
});
