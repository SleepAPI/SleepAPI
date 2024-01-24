import { Pokemon } from '../../domain/pokemon/pokemon';
import {
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  SubSkill,
  SUBSKILLS,
  SubskillSet,
} from '../../domain/stat/subskill';

export function getSubskillNames() {
  return SUBSKILLS.map((subskill) => subskill.name);
}

export function extractSubskillsBasedOnLevel(level: number, subskills: string[]): SubSkill[] {
  const subskill10 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[0]?.toUpperCase());
  const subskill25 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[1]?.toUpperCase());
  const subskill50 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[2]?.toUpperCase());
  const subskill75 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[3]?.toUpperCase());
  const subskill100 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[4]?.toUpperCase());

  const result: SubSkill[] = [];
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

export function subskillsForFilter(subskillSet: SubskillSet, level: number, pokemon: Pokemon): SubSkill[] {
  if (subskillSet === 'neutral') {
    return [];
  }

  const singleStageSubskillsLevel50 = [INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L];
  const optimalSubskills = [INGREDIENT_FINDER_M, HELPING_SPEED_M, INGREDIENT_FINDER_S, INVENTORY_L, HELPING_SPEED_S];

  const singleStageAndBetween50And59 = pokemon.carrySize === pokemon.maxCarrySize && level >= 50 && level < 60;
  const subskills = singleStageAndBetween50And59 ? singleStageSubskillsLevel50 : optimalSubskills;

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
