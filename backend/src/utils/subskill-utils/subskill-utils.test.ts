import { pokemon, subskill } from 'sleepapi-common';
import { extractSubskillsBasedOnLevel, limitSubSkillsToLevel, subskillsForFilter } from './subskill-utils';

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
      subskill.INGREDIENT_FINDER_S.name
    ];
    const expectedSubskills = subskill.SUBSKILLS.filter((s) =>
      [
        subskill.INGREDIENT_FINDER_M.name,
        subskill.HELPING_SPEED_M.name,
        subskill.INVENTORY_L.name,
        subskill.INGREDIENT_FINDER_S.name
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
      subskill.INVENTORY_M.name
    ];
    const expectedSubskills = subskill.SUBSKILLS.filter((s) =>
      [
        subskill.INGREDIENT_FINDER_M.name,
        subskill.HELPING_SPEED_M.name,
        subskill.INVENTORY_L.name,
        subskill.INGREDIENT_FINDER_S.name,
        subskill.INVENTORY_M.name
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
  it('should return the correct subskills for level 10', () => {
    expect(subskillsForFilter('ingredient', 10, pokemon.BLASTOISE)).toEqual([subskill.INGREDIENT_FINDER_M]);
  });

  it('should return the correct subskills for level 25', () => {
    expect(subskillsForFilter('ingredient', 25, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M
    ]);
  });

  it('should return the correct subskills for level 50', () => {
    expect(subskillsForFilter('ingredient', 50, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INGREDIENT_FINDER_S
    ]);
  });

  it('should return the correct subskills for level 75', () => {
    expect(subskillsForFilter('ingredient', 75, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INGREDIENT_FINDER_S,
      subskill.INVENTORY_L
    ]);
  });

  it('should return the correct subskills for level 100', () => {
    expect(subskillsForFilter('ingredient', 100, pokemon.BLASTOISE)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INGREDIENT_FINDER_S,
      subskill.INVENTORY_L,
      subskill.HELPING_SPEED_S
    ]);
  });

  it('should return the correct subskills for level 100, single-stage pokemon', () => {
    expect(subskillsForFilter('ingredient', 100, pokemon.PINSIR)).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INVENTORY_L,
      subskill.INGREDIENT_FINDER_S,
      subskill.HELPING_SPEED_S
    ]);
  });

  it('should return the correct subskills for berry pokemon', () => {
    expect(subskillsForFilter('berry', 100, pokemon.RAICHU)).toEqual([
      subskill.BERRY_FINDING_S,
      subskill.HELPING_SPEED_M,
      subskill.HELPING_SPEED_S,
      subskill.SKILL_TRIGGER_M,
      subskill.SKILL_TRIGGER_S
    ]);
  });

  it('should return the correct subskills for skill pokemon', () => {
    expect(subskillsForFilter('skill', 100, pokemon.SYLVEON)).toEqual([
      subskill.SKILL_TRIGGER_M,
      subskill.HELPING_SPEED_M,
      subskill.SKILL_TRIGGER_S,
      subskill.HELPING_SPEED_S,
      subskill.INVENTORY_L
    ]);
  });

  it('should return an empty array for level below 10', () => {
    expect(subskillsForFilter('ingredient', 5, pokemon.BLASTOISE)).toEqual([]);
  });
});

describe('limitSubSkillsToLevel', () => {
  it('shall return all subskills for level 100', () => {
    expect(
      limitSubSkillsToLevel(
        [
          subskill.INGREDIENT_FINDER_M,
          subskill.HELPING_SPEED_M,
          subskill.INGREDIENT_FINDER_S,
          subskill.INVENTORY_L,
          subskill.HELPING_SPEED_S
        ],
        100
      )
    ).toEqual([
      subskill.INGREDIENT_FINDER_M,
      subskill.HELPING_SPEED_M,
      subskill.INGREDIENT_FINDER_S,
      subskill.INVENTORY_L,
      subskill.HELPING_SPEED_S
    ]);
  });

  it('shall return first 3 subskills for level 60', () => {
    expect(
      limitSubSkillsToLevel(
        [
          subskill.INGREDIENT_FINDER_M,
          subskill.HELPING_SPEED_M,
          subskill.INGREDIENT_FINDER_S,
          subskill.INVENTORY_L,
          subskill.HELPING_SPEED_S
        ],
        60
      )
    ).toEqual([subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S]);
  });

  it('shall return first 3 subskills for level 50', () => {
    expect(
      limitSubSkillsToLevel(
        [
          subskill.INGREDIENT_FINDER_M,
          subskill.HELPING_SPEED_M,
          subskill.INGREDIENT_FINDER_S,
          subskill.INVENTORY_L,
          subskill.HELPING_SPEED_S
        ],
        50
      )
    ).toEqual([subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S]);
  });

  it('shall return first 2 subskills for level 49', () => {
    expect(
      limitSubSkillsToLevel(
        [
          subskill.INGREDIENT_FINDER_M,
          subskill.HELPING_SPEED_M,
          subskill.INGREDIENT_FINDER_S,
          subskill.INVENTORY_L,
          subskill.HELPING_SPEED_S
        ],
        49
      )
    ).toEqual([subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M]);
  });

  it('shall return first 2 subskills for level 25', () => {
    expect(
      limitSubSkillsToLevel(
        [
          subskill.INGREDIENT_FINDER_M,
          subskill.HELPING_SPEED_M,
          subskill.INGREDIENT_FINDER_S,
          subskill.INVENTORY_L,
          subskill.HELPING_SPEED_S
        ],
        25
      )
    ).toEqual([subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M]);
  });

  it('shall return first subskill for level <25', () => {
    expect(
      limitSubSkillsToLevel(
        [
          subskill.INGREDIENT_FINDER_M,
          subskill.HELPING_SPEED_M,
          subskill.INGREDIENT_FINDER_S,
          subskill.INVENTORY_L,
          subskill.HELPING_SPEED_S
        ],
        24
      )
    ).toEqual([subskill.INGREDIENT_FINDER_M]);
  });
});
