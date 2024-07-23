import { pokemon, subskill, SubskillSet } from 'sleepapi-common';

export function extractSubskillsBasedOnLevel(level: number, subskills: string[]): subskill.SubSkill[] {
  const subskill10 = subskill.SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[0]?.toUpperCase());
  const subskill25 = subskill.SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[1]?.toUpperCase());
  const subskill50 = subskill.SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[2]?.toUpperCase());
  const subskill75 = subskill.SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[3]?.toUpperCase());
  const subskill100 = subskill.SUBSKILLS.find(
    (subskill) => subskill.name.toUpperCase() === subskills[4]?.toUpperCase()
  );

  const result: subskill.SubSkill[] = [];
  if (level >= 10 && subskill10) {
    result.push(subskill10);
  }
  if (level >= 25 && subskill25) {
    result.push(subskill25);
  }
  if (level >= 50 && subskill50) {
    result.push(subskill50);
  }
  if (level >= 75 && subskill75) {
    result.push(subskill75);
  }
  if (level >= 100 && subskill100) {
    result.push(subskill100);
  }
  return result;
}

export function subskillsForFilter(
  subskillSet: SubskillSet,
  level: number,
  pokemon: pokemon.Pokemon
): subskill.SubSkill[] {
  const singleStageSubskillsLevel60: subskill.SubSkill[] = [];
  const optimalSubskills: subskill.SubSkill[] = [];
  if (subskillSet === 'skill') {
    singleStageSubskillsLevel60.push(
      ...[
        subskill.SKILL_TRIGGER_M,
        subskill.HELPING_SPEED_M,
        subskill.SKILL_TRIGGER_S,
        subskill.HELPING_SPEED_S,
        subskill.INVENTORY_L,
      ]
    );
    optimalSubskills.push(
      ...[
        subskill.SKILL_TRIGGER_M,
        subskill.HELPING_SPEED_M,
        subskill.SKILL_TRIGGER_S,
        subskill.HELPING_SPEED_S,
        subskill.INVENTORY_L,
      ]
    );
  } else if (subskillSet === 'berry') {
    singleStageSubskillsLevel60.push(
      ...[
        subskill.BERRY_FINDING_S,
        subskill.HELPING_SPEED_M,
        subskill.HELPING_SPEED_S,
        subskill.SKILL_TRIGGER_M,
        subskill.SKILL_TRIGGER_S,
      ]
    );
    optimalSubskills.push(
      ...[
        subskill.BERRY_FINDING_S,
        subskill.HELPING_SPEED_M,
        subskill.HELPING_SPEED_S,
        subskill.SKILL_TRIGGER_M,
        subskill.SKILL_TRIGGER_S,
      ]
    );
  } else {
    singleStageSubskillsLevel60.push(
      ...[
        subskill.INGREDIENT_FINDER_M,
        subskill.HELPING_SPEED_M,
        subskill.INVENTORY_L,
        subskill.INGREDIENT_FINDER_S,
        subskill.HELPING_SPEED_S,
      ]
    );
    optimalSubskills.push(
      ...[
        subskill.INGREDIENT_FINDER_M,
        subskill.HELPING_SPEED_M,
        subskill.INGREDIENT_FINDER_S,
        subskill.INVENTORY_L,
        subskill.HELPING_SPEED_S,
      ]
    );
  }

  const singleStageLevel60 = pokemon.previousEvolutions === 0 && level >= 60;
  const subskills = singleStageLevel60 ? singleStageSubskillsLevel60 : optimalSubskills;

  return limitSubSkillsToLevel(subskills, level);
}

export function limitSubSkillsToLevel(subskills: subskill.SubSkill[], level: number) {
  let numberOfElements;
  if (level < 10) {
    numberOfElements = 0;
  } else if (level < 25) {
    numberOfElements = 1;
  } else if (level < 50) {
    numberOfElements = 2;
  } else if (level < 75) {
    numberOfElements = 3;
  } else if (level < 100) {
    numberOfElements = 4;
  } else {
    numberOfElements = subskills.length;
  }

  return subskills.slice(0, numberOfElements);
}
