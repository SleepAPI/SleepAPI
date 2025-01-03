import type { PokemonProduce } from '@src/domain/combination/produce.js';
import type { IngredientSet, Mainskill, Produce, SkillActivation } from 'sleepapi-common';
import {
  METRONOME_SKILLS,
  emptyBerryInventory,
  emptyIngredientInventory,
  ingredient,
  mainskill
} from 'sleepapi-common';
import { calculateHelperBoostHelpsFromUnique } from '../skill-calculator.js';

export function createSkillEvent(
  params: {
    skill: Mainskill;
    skillLevel: number;
    nrOfHelpsToActivate: number;
    adjustedAmount: number;
    pokemonSet: PokemonProduce;
    skillActivations: SkillActivation[];
    uniqueHelperBoost: number;
    avgCritChancePerProc: number;
  },
  metronomeFactor = 1
) {
  const {
    skill,
    skillLevel,
    nrOfHelpsToActivate,
    adjustedAmount,
    pokemonSet,
    skillActivations,
    avgCritChancePerProc,
    uniqueHelperBoost
  } = params;
  switch (skill) {
    case mainskill.ENERGIZING_CHEER_S: {
      skillActivations.push(
        activateEnergizingCheer({ skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
    case mainskill.INGREDIENT_MAGNET_S: {
      skillActivations.push(
        activateIngredientMagnet({ skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
    case mainskill.DISGUISE_BERRY_BURST: {
      skillActivations.push(
        activateDisguiseBerryBurst({
          skillLevel,
          nrOfHelpsToActivate,
          adjustedAmount,
          pokemonSet,
          avgCritChancePerProc,
          metronomeFactor
        })
      );
      break;
    }
    case mainskill.EXTRA_HELPFUL_S: {
      skillActivations.push(
        activateExtraHelpful({
          skillLevel,
          nrOfHelpsToActivate,
          adjustedAmount,
          pokemonSet,
          metronomeFactor
        })
      );
      break;
    }
    case mainskill.HELPER_BOOST: {
      skillActivations.push(
        activateHelperBoost({
          skillLevel,
          nrOfHelpsToActivate,
          uniqueHelperBoost,
          adjustedAmount,
          pokemonSet,
          metronomeFactor
        })
      );
      break;
    }
    case mainskill.MOONLIGHT_CHARGE_ENERGY_S: {
      skillActivations.push(
        activateMoonlightChargeEnergy({ skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
    case mainskill.METRONOME: {
      activateMetronome(params);
      break;
    }
    default: {
      skillActivations.push(
        activateNonProduceSkills({ skill, skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
  }
}

export function activateEnergizingCheer(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  const skill = mainskill.ENERGIZING_CHEER_S;
  const divideByRandomAndMetronome = 5 * metronomeFactor;

  return {
    skill,
    adjustedAmount: (skill.amount(skillLevel) * adjustedAmount) / divideByRandomAndMetronome,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateMoonlightChargeEnergy(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  const skill = mainskill.MOONLIGHT_CHARGE_ENERGY_S;
  const teamSize = 5;

  const energyNormalProc = (skill.amount(skillLevel) * adjustedAmount) / metronomeFactor;
  const energyFromCrit = mainskill.moonlightCritAmount(skillLevel) / teamSize;
  const averageEnergyGained = energyNormalProc + energyFromCrit * skill.critChance;

  return {
    skill,
    adjustedAmount: averageEnergyGained,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateIngredientMagnet(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = mainskill.INGREDIENT_MAGNET_S;

  const divideByAverageIngredientAndMetronome = ingredient.INGREDIENTS.length * metronomeFactor;

  const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
    ingredient: ing,
    amount: (skill.amount(skillLevel) * adjustedAmount) / divideByAverageIngredientAndMetronome
  }));

  return {
    skill,
    adjustedAmount: (skill.amount(skillLevel) * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: {
      berries: emptyBerryInventory(),
      ingredients: magnetIngredients
    },
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateDisguiseBerryBurst(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonSet: PokemonProduce;
  avgCritChancePerProc: number;
  metronomeFactor: number;
}): SkillActivation {
  const {
    skillLevel,
    nrOfHelpsToActivate,
    adjustedAmount: fractionOfProc,
    pokemonSet,
    avgCritChancePerProc,
    metronomeFactor
  } = params;
  const skill = mainskill.DISGUISE_BERRY_BURST;

  const amountNoCrit = skill.amount(skillLevel) * fractionOfProc;

  const averageBerryAmount =
    (amountNoCrit + avgCritChancePerProc * amountNoCrit * (mainskill.DISGUISE_CRIT_MULTIPLIER - 1)) / metronomeFactor;

  return {
    skill,
    adjustedAmount: averageBerryAmount,
    nrOfHelpsToActivate,
    adjustedProduce: {
      // TODO: level is wrong, but not used in classic calc
      berries: [{ amount: averageBerryAmount, berry: pokemonSet.pokemon.berry, level: 0 }],
      ingredients: emptyIngredientInventory()
    },
    fractionOfProc: fractionOfProc / metronomeFactor,
    critChance: avgCritChancePerProc
  };
}

export function activateExtraHelpful(params: {
  skillLevel: number;
  pokemonSet: PokemonProduce;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, pokemonSet, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = mainskill.EXTRA_HELPFUL_S;

  const divideByRandomAndMetronome = 5 * metronomeFactor;

  const extraHelpfulProduce: Produce = {
    berries: pokemonSet.produce.berries.map(({ amount, berry, level }) => ({
      berry,
      amount: (amount * skill.amount(skillLevel) * adjustedAmount) / divideByRandomAndMetronome,
      level
    })),
    ingredients: pokemonSet.produce.ingredients.map(({ amount, ingredient }) => ({
      ingredient,
      amount: (amount * skill.amount(skillLevel) * adjustedAmount) / divideByRandomAndMetronome
    }))
  };

  return {
    skill,
    adjustedAmount: (adjustedAmount * skill.amount(skillLevel)) / divideByRandomAndMetronome,
    nrOfHelpsToActivate,
    adjustedProduce: extraHelpfulProduce,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateNonProduceSkills(params: {
  skill: Mainskill;
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skill, skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  return {
    skill,
    adjustedAmount: (skill.amount(skillLevel) * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateMetronome(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonSet: PokemonProduce;
  skillActivations: SkillActivation[];
  uniqueHelperBoost: number;
  avgCritChancePerProc: number;
}) {
  const skillsToActivate = METRONOME_SKILLS;

  for (const skillToActivate of skillsToActivate) {
    createSkillEvent({ ...params, skill: skillToActivate }, skillsToActivate.length);
  }
}

export function activateHelperBoost(params: {
  skillLevel: number;
  pokemonSet: PokemonProduce;
  uniqueHelperBoost: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}) {
  const { skillLevel, pokemonSet, uniqueHelperBoost, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = mainskill.HELPER_BOOST;

  const helpAmount =
    uniqueHelperBoost > 0
      ? skill.amount(skillLevel) + calculateHelperBoostHelpsFromUnique(uniqueHelperBoost, skillLevel)
      : 0;

  const helperBoostProduce: Produce = {
    berries: pokemonSet.produce.berries.map(({ amount, berry, level }) => ({
      berry,
      amount: (amount * helpAmount * adjustedAmount) / metronomeFactor,
      level
    })),
    ingredients: pokemonSet.produce.ingredients.map(({ amount, ingredient }) => ({
      ingredient,
      amount: (amount * helpAmount * adjustedAmount) / metronomeFactor
    }))
  };

  return {
    skill,
    adjustedAmount: (adjustedAmount * helpAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: helperBoostProduce,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}
