import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
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
    mainBedtime,
    mainWakeup,
  } = details;

  const subskills = maybeSubskills ?? [];
  const pokemon = getPokemon(pokemonName);

  const pokemonProductionWithLogs: { pokemonProduction: CustomPokemonCombinationWithProduce; log: ScheduledEvent[] }[] =
    [];

  let preGeneratedSkillActivations: SkillActivation[] | undefined = undefined;
  for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
    const customStats: CustomStats = {
      level,
      nature,
      subskills,
    };

    const { detailedProduce, log, skillActivations } = setupAndRunProductionSimulation({
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
