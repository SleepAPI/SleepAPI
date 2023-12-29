import { CustomStats } from '../../../domain/combination/custom';
import { Nature, RASH } from '../../../domain/stat/nature';
import {
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  INVENTORY_M,
  INVENTORY_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
  SubSkill,
  SubskillSet,
} from '../../../domain/stat/subskill';
import { roundDown } from '../../../utils/calculator-utils/calculator-utils';

export function extractIngredientSubskills(subskills: SubSkill[]) {
  const ingS = subskills.some(({ name }) => name === INGREDIENT_FINDER_S.name) ? INGREDIENT_FINDER_S.ingredient : 0;
  const ingM = subskills.some(({ name }) => name === INGREDIENT_FINDER_M.name) ? INGREDIENT_FINDER_M.ingredient : 0;
  return roundDown(1 + ingM + ingS, 2);
}

export function extractTriggerSubskills(subskills: SubSkill[]) {
  const triggerS = subskills.some(({ name }) => name === SKILL_TRIGGER_S.name) ? SKILL_TRIGGER_S.skill : 0;
  const triggerM = subskills.some(({ name }) => name === SKILL_TRIGGER_M.name) ? SKILL_TRIGGER_M.skill : 0;
  return roundDown(1 + triggerM + triggerS, 2);
}

export function extractInventorySubskills(subskills: SubSkill[]) {
  const invS = subskills.some(({ name }) => name === INVENTORY_S.name) ? INVENTORY_S.inventory : 0;
  const invM = subskills.some(({ name }) => name === INVENTORY_M.name) ? INVENTORY_M.inventory : 0;
  const invL = subskills.some(({ name }) => name === INVENTORY_L.name) ? INVENTORY_L.inventory : 0;
  return invS + invM + invL;
}

// Calculate help speed subskills and clamp at 35% boost
export function calculateHelpSpeedSubskills(subskills: SubSkill[], nrOfHelpBonus: number) {
  const clampedNrOfHelpBonus = Math.min(5, nrOfHelpBonus);
  const helpM = subskills.some(({ name }) => name === HELPING_SPEED_M.name) ? HELPING_SPEED_M.frequency : 0;
  const helpS = subskills.some(({ name }) => name === HELPING_SPEED_S.name) ? HELPING_SPEED_S.frequency : 0;
  const helpBonus = 0.05 * clampedNrOfHelpBonus;
  return roundDown(Math.max(0.65, 1 - helpM - helpS - helpBonus), 2);
}

export function invertNatureFrequecy(nature: Nature) {
  let result = 1;
  if (nature.frequency === 0.9) {
    result = 1.1;
  } else if (nature.frequency === 1.1) {
    result = 0.9;
  }
  return result;
}

export function subskillsForFilter(subskillSet: SubskillSet): SubSkill[] {
  if (subskillSet === 'neutral') {
    return [];
  } else {
    return [INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L];
  }
}

export function getOptimalIngredientStats(level: number): CustomStats {
  return {
    level,
    nature: RASH,
    subskills: subskillsForFilter('optimal'),
  };
}
