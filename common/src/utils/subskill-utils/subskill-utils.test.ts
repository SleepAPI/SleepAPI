import { describe, expect, it } from 'vitest';

import type { Subskill } from '../../domain/subskill/subskill';
import {
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  SUBSKILLS
} from '../../domain/subskill/subskills';
import { getSubskill, getSubskillNames, limitSubSkillsToLevel } from './subskill-utils';

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
  it.each(SUBSKILLS)('finds subskill "%s"', (ss: Subskill) => {
    const result = getSubskill(ss.name);
    expect(result).toEqual(ss);
  });

  it('shall throw if looking up missing subskill', () => {
    expect(() => getSubskill('missing')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't find Subskill with name missing]`
    );
  });
});

describe('limitSubSkillsToLevel', () => {
  it('shall return all subskills for level 100', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        100
      )
    ).toEqual(
      new Set([
        INGREDIENT_FINDER_M.name,
        HELPING_SPEED_M.name,
        INGREDIENT_FINDER_S.name,
        INVENTORY_L.name,
        HELPING_SPEED_S.name
      ])
    );
  });

  it('shall return first 3 subskills for level 60', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        60
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INGREDIENT_FINDER_S.name]));
  });

  it('shall return first 3 subskills for level 50', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        50
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INGREDIENT_FINDER_S.name]));
  });

  it('shall return first 2 subskills for level 49', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        49
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name]));
  });

  it('shall return first 2 subskills for level 25', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        25
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name]));
  });

  it('shall return first subskill for level <25', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        24
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name]));
  });
});
