import { BLASTOISE, PINSIR } from '@src/domain/pokemon/ingredient-pokemon';
import {
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  INVENTORY_M,
  SUBSKILLS,
} from '../../domain/stat/subskill';
import { extractSubskillsBasedOnLevel, getSubskillNames, subskillsForFilter } from './subskill-utils';

describe('getSubskillNames', () => {
  it('shall get all subskill names', () => {
    expect(getSubskillNames()).toMatchInlineSnapshot(`
      [
        "Berry Finding S",
        "Helping Speed S",
        "Helping Speed M",
        "Ingredient Finder S",
        "Ingredient Finder M",
        "Inventory Up S",
        "Inventory Up M",
        "Inventory Up L",
      ]
    `);
  });
});

describe('extractSubskillsBasedOnLevel', () => {
  it('should return the correct subskills for level 10', () => {
    const subskills = [INGREDIENT_FINDER_M.name];
    expect(extractSubskillsBasedOnLevel(10, subskills)).toContain(
      SUBSKILLS.find((s) => s.name.toUpperCase() === INGREDIENT_FINDER_M.name.toUpperCase())
    );
  });

  it('should return the correct subskills for level 25', () => {
    const subskills = [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name];
    const expectedSubskills = SUBSKILLS.filter((s) =>
      [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name].map((name) => name.toUpperCase()).includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(25, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return the correct subskills for level 50', () => {
    const subskills = [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INVENTORY_L.name];
    const expectedSubskills = SUBSKILLS.filter((s) =>
      [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INVENTORY_L.name]
        .map((name) => name.toUpperCase())
        .includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(50, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return the correct subskills for level 75', () => {
    const subskills = [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INVENTORY_L.name, INGREDIENT_FINDER_S.name];
    const expectedSubskills = SUBSKILLS.filter((s) =>
      [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INVENTORY_L.name, INGREDIENT_FINDER_S.name]
        .map((name) => name.toUpperCase())
        .includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(75, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return the correct subskills for level 100', () => {
    const subskills = [
      INGREDIENT_FINDER_M.name,
      HELPING_SPEED_M.name,
      INVENTORY_L.name,
      INGREDIENT_FINDER_S.name,
      INVENTORY_M.name,
    ];
    const expectedSubskills = SUBSKILLS.filter((s) =>
      [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INVENTORY_L.name, INGREDIENT_FINDER_S.name, INVENTORY_M.name]
        .map((name) => name.toUpperCase())
        .includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(100, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return an empty array if level is below 10', () => {
    expect(extractSubskillsBasedOnLevel(5, [INGREDIENT_FINDER_M.name])).toEqual([]);
  });
});

describe('subskillsForFilter', () => {
  it('should return an empty array for neutral subskill set', () => {
    expect(subskillsForFilter('neutral', 50, PINSIR)).toEqual([]);
  });

  it('should return the correct subskills for level 10 and optimal set', () => {
    expect(subskillsForFilter('optimal', 10, BLASTOISE)).toEqual([INGREDIENT_FINDER_M]);
  });

  it('should return the correct subskills for level 25 and optimal set', () => {
    expect(subskillsForFilter('optimal', 25, BLASTOISE)).toEqual([INGREDIENT_FINDER_M, HELPING_SPEED_M]);
  });

  it('should return the correct subskills for level 50 and optimal set', () => {
    expect(subskillsForFilter('optimal', 50, BLASTOISE)).toEqual([INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L]);
  });

  it('should return the correct subskills for level 75 and optimal set', () => {
    expect(subskillsForFilter('optimal', 75, BLASTOISE)).toEqual([
      INGREDIENT_FINDER_M,
      HELPING_SPEED_M,
      INVENTORY_L,
      INGREDIENT_FINDER_S,
    ]);
  });

  it('should return the correct subskills for level 100 and optimal set', () => {
    expect(subskillsForFilter('optimal', 100, BLASTOISE)).toEqual([
      INGREDIENT_FINDER_M,
      HELPING_SPEED_M,
      INVENTORY_L,
      INGREDIENT_FINDER_S,
      HELPING_SPEED_S,
    ]);
  });

  it('should return the correct subskills for level 100, single-stage pokemon, and optimal set', () => {
    expect(subskillsForFilter('optimal', 100, PINSIR)).toEqual([
      INGREDIENT_FINDER_M,
      INVENTORY_L,
      HELPING_SPEED_M,
      INGREDIENT_FINDER_S,
      INVENTORY_M,
    ]);
  });

  it('should return an empty array for level below 10', () => {
    expect(subskillsForFilter('optimal', 5, BLASTOISE)).toEqual([]);
  });
});
