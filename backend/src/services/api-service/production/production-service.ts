import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { chooseIngredientSet } from '@src/utils/production-utils/production-utils';
import { CustomPokemonCombinationWithProduce, CustomStats } from '../../../domain/combination/custom';
import { getPokemon } from '../../../utils/pokemon-utils/pokemon-utils';
import { getAllIngredientCombinationsForLevel } from '../../calculator/ingredient/ingredient-calculate';

export function calculatePokemonProduction(
  pokemonName: string,
  details: ProductionStats,
  ingredientSet: string[],
  monteCarloIterations: number
) {
  const {
    level,
    nature,
    subskills: maybeSubskills,
    e4e,
    helpingBonus,
    camp,
    erb,
    cheer,
    incense,
    skillLevel,
    mainBedtime,
    mainWakeup,
  } = details;

  const subskills = maybeSubskills ?? [];
  const pokemon = getPokemon(pokemonName);

  const pokemonProductionWithLogs: {
    pokemonProduction: CustomPokemonCombinationWithProduce;
    log: ScheduledEvent[];
    summary: Summary;
  }[] = [];

  let preGeneratedSkillActivations: SkillActivation[] | undefined = undefined;
  for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
    const customStats: CustomStats = {
      level,
      nature,
      subskills,
      skillLevel,
    };

    const { detailedProduce, log, skillActivations, summary } = setupAndRunProductionSimulation({
      pokemonCombination: {
        pokemon: pokemon,
        ingredientList,
      },
      input: {
        ...customStats,
        e4e,
        camp,
        helpingBonus,
        erb,
        cheer,
        incense,
        mainBedtime,
        mainWakeup,
      },
      monteCarloIterations,
      preGeneratedSkillActivations,
    });
    preGeneratedSkillActivations = skillActivations;

    pokemonProductionWithLogs.push({
      pokemonProduction: { pokemonCombination: { pokemon, ingredientList }, detailedProduce, customStats },
      log,
      summary,
    });
  }

  const productionForChosenIngSet = chooseIngredientSet(pokemonProductionWithLogs, ingredientSet);

  return {
    filters: {
      ...details,
      subskills,
    },
    production: productionForChosenIngSet,
    allIngredientSets: pokemonProductionWithLogs,
  };
}
