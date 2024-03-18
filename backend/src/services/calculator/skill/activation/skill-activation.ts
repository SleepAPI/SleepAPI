import { PokemonProduce, Produce } from '@src/domain/combination/produce';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { BerrySet, IngredientSet, ingredient, mainskill } from 'sleepapi-common';
import { emptyBerrySet } from '../../berry/berry-calculator';

export function createSkillEvent(
  params: {
    skill: mainskill.MainSkill;
    skillLevel: number;
    nrOfHelpsToActivate: number;
    adjustedAmount: number;
    pokemonWithAverageProduce: PokemonProduce;
    skillActivations: SkillActivation[];
  },
  metronomeFactor = 1
) {
  const { skill, skillLevel, nrOfHelpsToActivate, adjustedAmount, pokemonWithAverageProduce, skillActivations } =
    params;
  switch (skill) {
    case mainskill.ENERGIZING_CHEER_S: {
      skillActivations.push(
        activateEnergizingCheer({ skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
    case mainskill.INGREDIENT_MAGNET_S: {
      const berries = emptyBerrySet(pokemonWithAverageProduce.pokemon.berry);
      skillActivations.push(
        activateIngredientMagnet({ skillLevel, nrOfHelpsToActivate, adjustedAmount, berries, metronomeFactor })
      );
      break;
    }
    case mainskill.EXTRA_HELPFUL_S: {
      skillActivations.push(
        activateExtraHelpful({
          skillLevel,
          nrOfHelpsToActivate,
          adjustedAmount,
          pokemonWithAverageProduce,
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
  berries: BerrySet;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, berries, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
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
      berries,
      ingredients: magnetIngredients,
    },
    fractionOfProc: adjustedAmount / metronomeFactor,
  };
}

export function activateExtraHelpful(params: {
  skillLevel: number;
  pokemonWithAverageProduce: PokemonProduce;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, pokemonWithAverageProduce, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = mainskill.EXTRA_HELPFUL_S;

  const divideByRandomAndMetronome = 5 * metronomeFactor;

  const extraHelpfulProduce: Produce = {
    berries: {
      berry: pokemonWithAverageProduce.produce.berries.berry,
      amount:
        (pokemonWithAverageProduce.produce.berries.amount * skill.amount[skillLevel - 1] * adjustedAmount) /
        divideByRandomAndMetronome,
    },
    ingredients: pokemonWithAverageProduce.produce.ingredients.map(({ amount, ingredient }) => ({
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
  skill: mainskill.MainSkill;
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
  pokemonWithAverageProduce: PokemonProduce;
  skillActivations: SkillActivation[];
}) {
  const skillsToActivate = mainskill.MAINSKILLS.filter(
    (s) => s !== mainskill.METRONOME && s !== mainskill.HELPER_BOOST // TODO: can Metronome roll Helper Boost?
  );

  for (const skillToActivate of skillsToActivate) {
    createSkillEvent({ ...params, skill: skillToActivate }, skillsToActivate.length);
  }
}
