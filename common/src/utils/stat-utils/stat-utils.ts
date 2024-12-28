import type { Nature } from '../../domain/nature';
import type { Pokemon } from '../../domain/pokemon';
import type { SubSkill } from '../../domain/subskill';
import {
  BERRY_FINDING_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S
} from '../../domain/subskill';
import { MathUtils } from '../../utils/math-utils';

export function calculateIngredientPercentage(params: { pokemon: Pokemon; nature: Nature; subskills: SubSkill[] }) {
  const { pokemon, nature, subskills } = params;
  const ingredientSubskills = extractIngredientSubskills(subskills);
  const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;
  return ingredientPercentage;
}

export function extractIngredientSubskills(subskills: SubSkill[]) {
  const ingS = subskills.some(({ name }) => name === INGREDIENT_FINDER_S.name) ? INGREDIENT_FINDER_S.amount : 0;
  const ingM = subskills.some(({ name }) => name === INGREDIENT_FINDER_M.name) ? INGREDIENT_FINDER_M.amount : 0;
  return MathUtils.round(1 + ingM + ingS, 2);
}

export function calculateSkillPercentage(basePercentage: number, subskills: SubSkill[], nature: Nature) {
  const triggerSubskills = extractTriggerSubskills(subskills);
  return (basePercentage / 100) * triggerSubskills * nature.skill;
}

export function calculateSkillPercentageWithPityProc(pokemon: Pokemon, subskills: SubSkill[], nature: Nature) {
  const skillPercentWithoutPity = calculateSkillPercentage(pokemon.skillPercentage, subskills, nature);
  const pityProcThreshold = calculatePityProcThreshold(pokemon);
  return skillPercentWithoutPity / (1 - Math.pow(1 - skillPercentWithoutPity, pityProcThreshold + 1));
}

export function calculatePityProcThreshold(pokemon: Pokemon) {
  return pokemon.specialty === 'skill' ? Math.floor(144000 / pokemon.frequency) : 78;
}

export function extractTriggerSubskills(subskills: SubSkill[]) {
  const triggerS = subskills.some(({ name }) => name === SKILL_TRIGGER_S.name) ? SKILL_TRIGGER_S.amount : 0;
  const triggerM = subskills.some(({ name }) => name === SKILL_TRIGGER_M.name) ? SKILL_TRIGGER_M.amount : 0;
  return MathUtils.round(1 + triggerM + triggerS, 2);
}

export function calculateNrOfBerriesPerDrop(pokemon: Pokemon, subskills: SubSkill[]) {
  let base = 1;
  if (pokemon.specialty === 'berry') {
    base += 1;
  }
  if (subskills.some((ss) => ss.name.toLowerCase() === BERRY_FINDING_S.name.toLowerCase())) {
    base += 1;
  }
  return base;
}

export function calculateRibbonFrequency(pokemon: Pokemon, ribbonLevel: number) {
  let ribbonFrequency = 1;

  if (ribbonLevel >= 2) {
    if (pokemon.remainingEvolutions === 1) {
      ribbonFrequency -= 0.05;
    } else if (pokemon.remainingEvolutions === 2) {
      ribbonFrequency -= 0.11;
    }
  }

  if (ribbonLevel >= 4) {
    if (pokemon.remainingEvolutions === 1) {
      ribbonFrequency -= 0.07;
    } else if (pokemon.remainingEvolutions === 2) {
      ribbonFrequency -= 0.14;
    }
  }

  return ribbonFrequency;
}
