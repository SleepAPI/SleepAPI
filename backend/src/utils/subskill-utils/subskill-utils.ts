import {
  HELPING_SPEED_M,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  INVENTORY_M,
  SubSkill,
  SUBSKILLS,
  SubskillSet,
} from '../../domain/stat/subskill';

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

export function subskillsForFilter(subskillSet: SubskillSet, level: number): SubSkill[] {
  if (subskillSet === 'neutral') {
    return [];
  }

  const subskills = [];
  if (level >= 10) {
    subskills.push(INGREDIENT_FINDER_M);
  }
  if (level >= 25) {
    subskills.push(HELPING_SPEED_M);
  }
  if (level >= 50) {
    subskills.push(INVENTORY_L);
  }
  if (level >= 75) {
    subskills.push(INGREDIENT_FINDER_S);
  }
  if (level >= 100) {
    subskills.push(INVENTORY_M);
  }
  return subskills;
}
