import { PokemonProduce } from '@src/domain/combination/produce';
import {
  IngredientSet,
  Mainskill,
  Produce,
  SkillActivation,
  emptyBerryInventory,
  emptyIngredientInventory,
  ingredient,
  mainskill,
} from 'sleepapi-common';
import { calculateHelperBoostHelpsFromUnique } from '../skill-calculator';

// TODO: need to support moonlight crit,it's like energizing cheer and can hit umbreon
// TODO: if it just has flat crit chance on every skill proc then we can probably just calc average energy per member from crit
export function createSkillEvent(
  params: {
    skill: Mainskill;
    skillLevel: number;
    nrOfHelpsToActivate: number;
    adjustedAmount: number;
    pokemonSet: PokemonProduce;
    skillActivations: SkillActivation[];
    uniqueHelperBoost: number;
  },
  metronomeFactor = 1
) {
  const { skill, skillLevel, nrOfHelpsToActivate, adjustedAmount, pokemonSet, skillActivations, uniqueHelperBoost } =
    params;
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
        activateDisguiseBerryBurst({ skillLevel, nrOfHelpsToActivate, adjustedAmount, pokemonSet, metronomeFactor })
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
          metronomeFactor,
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
          metronomeFactor,
        })
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
    adjustedAmount: (skill.amount[skillLevel - 1] * adjustedAmount) / divideByRandomAndMetronome,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor,
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
    amount: (skill.amount[skillLevel - 1] * adjustedAmount) / divideByAverageIngredientAndMetronome,
  }));

  return {
    skill,
    adjustedAmount: (skill.amount[skillLevel - 1] * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: {
      berries: emptyBerryInventory(),
      ingredients: magnetIngredients,
    },
    fractionOfProc: adjustedAmount / metronomeFactor,
  };
}

export function activateDisguiseBerryBurst(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonSet: PokemonProduce;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, nrOfHelpsToActivate, adjustedAmount, pokemonSet, metronomeFactor } = params;
  const skill = mainskill.DISGUISE_BERRY_BURST;

  return {
    skill,
    adjustedAmount: (skill.amount[skillLevel - 1] * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: {
      // TODO: level is wrong, but not used in classic calc
      berries: [{ amount: skill.amount[skillLevel - 1] * adjustedAmount, berry: pokemonSet.pokemon.berry, level: 0 }],
      ingredients: emptyIngredientInventory(),
    },
    fractionOfProc: adjustedAmount / metronomeFactor,
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
      amount: (amount * skill.amount[skillLevel - 1] * adjustedAmount) / divideByRandomAndMetronome,
      level,
    })),
    ingredients: pokemonSet.produce.ingredients.map(({ amount, ingredient }) => ({
      ingredient,
      amount: (amount * skill.amount[skillLevel - 1] * adjustedAmount) / divideByRandomAndMetronome,
    })),
  };

  return {
    skill,
    adjustedAmount: (adjustedAmount * skill.amount[skillLevel - 1]) / divideByRandomAndMetronome,
    nrOfHelpsToActivate,
    adjustedProduce: extraHelpfulProduce,
    fractionOfProc: adjustedAmount / metronomeFactor,
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
    adjustedAmount: (skill.amount[skillLevel - 1] * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor,
  };
}

export function activateMetronome(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonSet: PokemonProduce;
  skillActivations: SkillActivation[];
  uniqueHelperBoost: number;
}) {
  const skillsToActivate = mainskill.METRONOME_SKILLS;

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
      ? skill.amount[skillLevel - 1] + calculateHelperBoostHelpsFromUnique(uniqueHelperBoost, skillLevel)
      : 0;

  const helperBoostProduce: Produce = {
    berries: pokemonSet.produce.berries.map(({ amount, berry, level }) => ({
      berry,
      amount: (amount * helpAmount * adjustedAmount) / metronomeFactor,
      level,
    })),
    ingredients: pokemonSet.produce.ingredients.map(({ amount, ingredient }) => ({
      ingredient,
      amount: (amount * helpAmount * adjustedAmount) / metronomeFactor,
    })),
  };

  return {
    skill,
    adjustedAmount: (adjustedAmount * helpAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: helperBoostProduce,
    fractionOfProc: adjustedAmount / metronomeFactor,
  };
}
