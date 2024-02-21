import { PokemonProduce, Produce } from '@src/domain/combination/produce';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { countInventory } from '@src/utils/inventory-utils/inventory-utils';
import { BerrySet, IngredientSet, ingredient, mainskill } from 'sleepapi-common';
import { emptyBerrySet } from '../../berry/berry-calculator';

export function createSkillEvent(
  params: {
    skill: mainskill.MainSkill;
    nrOfHelpsToActivate: number;
    adjustedAmount: number;
    pokemonWithAverageProduce: PokemonProduce;
    skillActivations: SkillActivation[];
  },
  metronomeFactor = 1
) {
  const { skill, nrOfHelpsToActivate, adjustedAmount, pokemonWithAverageProduce, skillActivations } = params;
  switch (skill) {
    case mainskill.ENERGIZING_CHEER_S: {
      skillActivations.push(activateEnergizingCheer({ nrOfHelpsToActivate, adjustedAmount, metronomeFactor }));
      break;
    }
    case mainskill.INGREDIENT_MAGNET_S: {
      const berries = emptyBerrySet(pokemonWithAverageProduce.pokemon.berry);
      skillActivations.push(
        activateIngredientMagnet({ nrOfHelpsToActivate, adjustedAmount, berries, metronomeFactor })
      );
      break;
    }
    case mainskill.EXTRA_HELPFUL_S: {
      skillActivations.push(
        activateExtraHelpful({ nrOfHelpsToActivate, adjustedAmount, pokemonWithAverageProduce, metronomeFactor })
      );
      break;
    }
    case mainskill.METRONOME: {
      activateMetronome(params);
      break;
    }
    default: {
      skillActivations.push(activateNonProduceSkills({ skill, nrOfHelpsToActivate, adjustedAmount, metronomeFactor }));
      break;
    }
  }
}

export function activateEnergizingCheer(params: {
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  const skill = mainskill.ENERGIZING_CHEER_S;
  const divideByRandomAndMetronome = 5 * metronomeFactor;

  return {
    skill,
    adjustedAmount: (skill.amount * adjustedAmount) / divideByRandomAndMetronome,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount,
  };
}

export function activateIngredientMagnet(params: {
  berries: BerrySet;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { berries, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = mainskill.INGREDIENT_MAGNET_S;

  const divideByAverageIngredientAndMetronome = ingredient.INGREDIENTS.length * metronomeFactor;

  const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
    ingredient: ing,
    amount: (skill.amount * adjustedAmount) / divideByAverageIngredientAndMetronome,
  }));

  return {
    skill,
    adjustedAmount: (skill.amount * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: {
      berries,
      ingredients: magnetIngredients,
    },
    fractionOfProc: adjustedAmount,
  };
}

export function activateExtraHelpful(params: {
  pokemonWithAverageProduce: PokemonProduce;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { pokemonWithAverageProduce, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = mainskill.EXTRA_HELPFUL_S;

  const divideByRandomAndMetronome = 5 * metronomeFactor;

  const extraHelpfulProduce: Produce = {
    berries: {
      berry: pokemonWithAverageProduce.produce.berries.berry,
      amount:
        (pokemonWithAverageProduce.produce.berries.amount * skill.amount * adjustedAmount) / divideByRandomAndMetronome,
    },
    ingredients: pokemonWithAverageProduce.produce.ingredients.map(({ amount, ingredient }) => ({
      ingredient,
      amount: (amount * skill.amount * adjustedAmount) / divideByRandomAndMetronome,
    })),
  };

  return {
    skill,
    adjustedAmount: countInventory(extraHelpfulProduce),
    nrOfHelpsToActivate,
    adjustedProduce: extraHelpfulProduce,
    fractionOfProc: adjustedAmount,
  };
}

export function activateMetronome(params: {
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonWithAverageProduce: PokemonProduce;
  skillActivations: SkillActivation[];
}) {
  const skillsToActivate = mainskill.MAINSKILLS.filter((s) => s !== mainskill.METRONOME);

  for (const skillToActivate of skillsToActivate) {
    createSkillEvent({ ...params, skill: skillToActivate }, skillsToActivate.length);
  }
}

export function activateNonProduceSkills(params: {
  skill: mainskill.MainSkill;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skill, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  return {
    skill,
    adjustedAmount: (skill.amount * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount,
  };
}
