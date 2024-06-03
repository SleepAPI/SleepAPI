import { describe, expect, it } from 'vitest';
import { SUBSKILLS, SubSkill } from '../../domain/subskill';
import { getSubskill, getSubskillNames } from './subskill-utils';

describe('getSubskillNames', () => {
  it('shall get all subskill names', () => {
    expect(getSubskillNames()).toMatchInlineSnapshot(`
      [
        "Berry Finding S",
        "Dream Shard Bonus",
        "Energy Recovery Bonus",
        "Helping Bonus",
        "Helping Speed S",
        "Helping Speed M",
        "Ingredient Finder S",
        "Ingredient Finder M",
        "Inventory Up S",
        "Inventory Up M",
        "Inventory Up L",
        "Research EXP Bonus",
        "Skill Level Up M",
        "Skill Level Up S",
        "Skill Trigger M",
        "Skill Trigger S",
        "Sleep EXP Bonus",
      ]
    `);
  });
});

describe('getSubskill', () => {
  it.each(SUBSKILLS)('finds subskill "%s"', (ss: SubSkill) => {
    const result = getSubskill(ss.name);
    expect(result).toEqual(ss);
  });

  it('shall throw if looking up missing subskill', () => {
    expect(() => getSubskill('missing')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't find Subskill with name missing]`,
    );
  });
});
