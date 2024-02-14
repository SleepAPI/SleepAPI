import { CustomStats } from '@src/domain/combination/custom';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { subskillsForFilter } from '@src/utils/subskill-utils/subskill-utils';
import { nature, pokemon, subskill } from 'sleepapi-common';

export function extractIngredientSubskills(subskills: subskill.SubSkill[]) {
  const ingS = subskills.some(({ name }) => name === subskill.INGREDIENT_FINDER_S.name)
    ? subskill.INGREDIENT_FINDER_S.amount
    : 0;
  const ingM = subskills.some(({ name }) => name === subskill.INGREDIENT_FINDER_M.name)
    ? subskill.INGREDIENT_FINDER_M.amount
    : 0;
  return roundDown(1 + ingM + ingS, 2);
}

export function extractTriggerSubskills(subskills: subskill.SubSkill[]) {
  const triggerS = subskills.some(({ name }) => name === subskill.SKILL_TRIGGER_S.name)
    ? subskill.SKILL_TRIGGER_S.amount
    : 0;
  const triggerM = subskills.some(({ name }) => name === subskill.SKILL_TRIGGER_M.name)
    ? subskill.SKILL_TRIGGER_M.amount
    : 0;
  return roundDown(1 + triggerM + triggerS, 2);
}

export function calculateSubskillCarrySize(subskills: subskill.SubSkill[]): number {
  const invS = subskills.some(({ name }) => name === subskill.INVENTORY_S.name) ? subskill.INVENTORY_S.amount : 0;
  const invM = subskills.some(({ name }) => name === subskill.INVENTORY_M.name) ? subskill.INVENTORY_M.amount : 0;
  const invL = subskills.some(({ name }) => name === subskill.INVENTORY_L.name) ? subskill.INVENTORY_L.amount : 0;
  return invS + invM + invL;
}

// Calculate help speed subskills and clamp at 35% boost
export function calculateHelpSpeedSubskills(subskills: subskill.SubSkill[], nrOfHelpBonus: number) {
  const clampedNrOfHelpBonus = Math.min(5, nrOfHelpBonus);
  const helpM = subskills.some(({ name }) => name === subskill.HELPING_SPEED_M.name)
    ? subskill.HELPING_SPEED_M.amount
    : 0;
  const helpS = subskills.some(({ name }) => name === subskill.HELPING_SPEED_S.name)
    ? subskill.HELPING_SPEED_S.amount
    : 0;
  const helpBonus = 0.05 * clampedNrOfHelpBonus;
  return roundDown(Math.max(0.65, 1 - helpM - helpS - helpBonus), 2);
}

export function invertNatureFrequecy(nature: nature.Nature) {
  let result = 1;
  if (nature.frequency === 0.9) {
    result = 1.1;
  } else if (nature.frequency === 1.1) {
    result = 0.9;
  }
  return result;
}

export function getOptimalIngredientStats(level: number, pokemon: pokemon.Pokemon): CustomStats {
  return {
    level,
    nature: nature.RASH,
    subskills: subskillsForFilter('optimal', level, pokemon),
  };
}
