import type { Nature } from '../../domain/nature';
import type { Pokemon, PokemonSpecialty } from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S
} from '../../domain/subskill/subskills';
import { MathUtils } from '../../utils/math-utils';

export function calculateIngredientPercentage(params: { pokemon: Pokemon; nature: Nature; subskills: Set<string> }) {
  const { pokemon, nature, subskills } = params;
  const ingredientSubskills = extractIngredientSubskills(subskills);
  const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;
  return ingredientPercentage;
}

export function extractIngredientSubskills(subskills: Set<string>) {
  const ingS = subskills.has(INGREDIENT_FINDER_S.name) ? INGREDIENT_FINDER_S.amount : 0;
  const ingM = subskills.has(INGREDIENT_FINDER_M.name) ? INGREDIENT_FINDER_M.amount : 0;
  return MathUtils.round(1 + ingM + ingS, 2);
}

export function calculateSkillPercentage(basePercentage: number, subskills: Set<string>, nature: Nature) {
  const triggerSubskills = extractTriggerSubskills(subskills);
  return (basePercentage / 100) * triggerSubskills * nature.skill;
}

export function calculateSkillPercentageWithPityProc(pokemon: Pokemon, subskills: Set<string>, nature: Nature) {
  const skillPercentWithoutPity = calculateSkillPercentage(pokemon.skillPercentage, subskills, nature);
  const pityProcThreshold = calculatePityProcThreshold(pokemon);
  return skillPercentWithoutPity / (1 - Math.pow(1 - skillPercentWithoutPity, pityProcThreshold + 1));
}

export function calculatePityProcThreshold(pokemon: Pokemon) {
  return pokemon.specialty === 'skill' ? Math.floor(144000 / pokemon.frequency) : 78;
}

export function extractTriggerSubskills(subskills: Set<string>) {
  const triggerS = subskills.has(SKILL_TRIGGER_S.name) ? SKILL_TRIGGER_S.amount : 0;
  const triggerM = subskills.has(SKILL_TRIGGER_M.name) ? SKILL_TRIGGER_M.amount : 0;
  return MathUtils.round(1 + triggerM + triggerS, 2);
}

export function calculateNrOfBerriesPerDrop(specialty: PokemonSpecialty, subskills: Set<string>) {
  let result = specialty === 'berry' ? 2 : 1;
  if (subskills.has(BERRY_FINDING_S.name)) {
    result += 1;
  }
  return result;
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
