import { pokemon, subskill } from 'sleepapi-common';
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
        "Skill Trigger M",
        "Skill Trigger S",
        "Energy Recovery Bonus",
      ]
    `);
  });
});

describe('extractSubskillsBasedOnLevel', () => {
  it('should return the correct subskills for level 10', () => {
    const subskills = [subskill.INGREDIENT_FINDER_M.name];
    expect(extractSubskillsBasedOnLevel(10, subskills)).toContain(
      subskill.SUBSKILLS.find((s) => s.name.toUpperCase() === subskill.INGREDIENT_FINDER_M.name.toUpperCase())
    );
  });

  it('should return the correct subskills for level 25', () => {
    const subskills = [subskill.INGREDIENT_FINDER_M.name, subskill.HELPING_SPEED_M.name];
    const expectedSubskills = subskill.SUBSKILLS.filter((s) =>
      [subskill.INGREDIENT_FINDER_M.name, subskill.HELPING_SPEED_M.name]
        .map((name) => name.toUpperCase())
        .includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(25, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return the correct subskills for level 50', () => {
    const subskills = [subskill.INGREDIENT_FINDER_M.name, subskill.HELPING_SPEED_M.name, subskill.INVENTORY_L.name];
    const expectedSubskills = subskill.SUBSKILLS.filter((s) =>
      [subskill.INGREDIENT_FINDER_M.name, subskill.HELPING_SPEED_M.name, subskill.INVENTORY_L.name]
        .map((name) => name.toUpperCase())
        .includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(50, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return the correct subskills for level 75', () => {
    const subskills = [
      subskill.INGREDIENT_FINDER_M.name,
      subskill.HELPING_SPEED_M.name,
      subskill.INVENTORY_L.name,
      subskill.INGREDIENT_FINDER_S.name,
    ];
    const expectedSubskills = subskill.SUBSKILLS.filter((s) =>
      [
        subskill.INGREDIENT_FINDER_M.name,
        subskill.HELPING_SPEED_M.name,
        subskill.INVENTORY_L.name,
        subskill.INGREDIENT_FINDER_S.name,
      ]
        .map((name) => name.toUpperCase())
        .includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(75, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return the correct subskills for level 100', () => {
    const subskills = [
      subskill.INGREDIENT_FINDER_M.name,
      subskill.HELPING_SPEED_M.name,
      subskill.INVENTORY_L.name,
      subskill.INGREDIENT_FINDER_S.name,
      subskill.INVENTORY_M.name,
    ];
    const expectedSubskills = subskill.SUBSKILLS.filter((s) =>
      [
        subskill.INGREDIENT_FINDER_M.name,
        subskill.HELPING_SPEED_M.name,
        subskill.INVENTORY_L.name,
        subskill.INGREDIENT_FINDER_S.name,
        subskill.INVENTORY_M.name,
      ]
        .map((name) => name.toUpperCase())
        .includes(s.name.toUpperCase())
    );
    expect(extractSubskillsBasedOnLevel(100, subskills)).toEqual(expect.arrayContaining(expectedSubskills));
  });

  it('should return an empty array if level is below 10', () => {
    expect(extractSubskillsBasedOnLevel(5, [subskill.INGREDIENT_FINDER_M.name])).toEqual([]);
  });
});

describe('subskillsForFilter', () => {
  it('should return an empty array for neutral subskill set', () => {
    expect(subskillsForFilter('neutral', 50, pokemon.PINSIR)).toEqual([]);
  });

  it('should return the correct subskills for level 10 and optimal set', () => {
    expect(subskillsForFilter('optimal', 10, pokemon.BLASTOISE)).toEqual([subskill.INGREDIENT_FINDER_M]);
  });

  it('should return the correct subskills for level 25 and optimal set', () => {
    expect(subskillsForFilter('optimal', 25, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
    ]);
  });

  it('should return the correct subskills for level 50 and optimal set', () => {
    expect(subskillsForFilter('optimal', 50, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INGREDIENT_FINDER_S,
    ]);
  });

  it('should return the correct subskills for level 75 and optimal set', () => {
    expect(subskillsForFilter('optimal', 75, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INGREDIENT_FINDER_S,
      subskill.INVENTORY_L,
    ]);
  });

  it('should return the correct subskills for level 100 and optimal set', () => {
    expect(subskillsForFilter('optimal', 100, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INGREDIENT_FINDER_S,
      subskill.INVENTORY_L,
      subskill.HELPING_SPEED_S,
    ]);
  });

  it('should return the correct subskills for level 100, single-stage pokemon, and optimal set', () => {
    expect(subskillsForFilter('optimal', 100, pokemon.PINSIR)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INVENTORY_L,
      subskill.INGREDIENT_FINDER_S,
      subskill.HELPING_SPEED_S,
    ]);
  });

  it('should return an empty array for level below 10', () => {
    expect(subskillsForFilter('optimal', 5, pokemon.BLASTOISE)).toEqual([]);
  });
});
