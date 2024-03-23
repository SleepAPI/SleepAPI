import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { chooseIngredientSet } from '@src/utils/production-utils/production-utils';
import { pokemon } from 'sleepapi-common';
import { CustomPokemonCombinationWithProduce, CustomStats } from '../../../domain/combination/custom';
import { getAllIngredientCombinationsForLevel } from '../../calculator/ingredient/ingredient-calculate';

export function calculatePokemonProduction(
  pokemon: pokemon.Pokemon,
  details: ProductionStats,
  ingredientSet: string[],
  monteCarloIterations: number
) {
  const {
    level,
    nature,
    subskills,
    e4eProcs,
    e4eLevel,
    cheer,
    extraHelpful,
    helperBoostProcs,
    helperBoostUnique,
    helperBoostLevel,
    helpingBonus,
    camp,
    erb,
    incense,
    skillLevel,
    mainBedtime,
    mainWakeup,
  } = details;

  const customStats: CustomStats = {
    level,
    nature: nature!,
    subskills: subskills!,
    skillLevel: skillLevel!,
  };

  const pokemonProductionWithLogs: {
    pokemonProduction: CustomPokemonCombinationWithProduce;
    log: ScheduledEvent[];
    summary: Summary;
  }[] = [];

  let preGeneratedSkillActivations: SkillActivation[] | undefined = undefined;
  for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
    const { detailedProduce, averageProduce, log, skillActivations, summary } = setupAndRunProductionSimulation({
      pokemonCombination: {
        pokemon: pokemon,
        ingredientList,
      },
      input: {
        e4eProcs,
        e4eLevel,
        camp,
        helpingBonus,
        erb,
        cheer,
        extraHelpful,
        helperBoostProcs,
        helperBoostUnique,
        helperBoostLevel,
        incense,
        mainBedtime,
        mainWakeup,
        ...customStats,
      },
      monteCarloIterations,
      preGeneratedSkillActivations,
    });
    preGeneratedSkillActivations = skillActivations;

    pokemonProductionWithLogs.push({
      pokemonProduction: {
        pokemonCombination: { pokemon, ingredientList },
        averageProduce,
        detailedProduce,
        customStats,
      },

      log,
      summary,
    });
  }

  const productionForChosenIngSet = chooseIngredientSet(pokemonProductionWithLogs, ingredientSet);

  return {
    filters: {
      ...details,
      ...customStats,
    },
    production: productionForChosenIngSet,
    allIngredientSets: pokemonProductionWithLogs,
  };
}
