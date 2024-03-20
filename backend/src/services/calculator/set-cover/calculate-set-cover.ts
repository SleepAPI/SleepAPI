import { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom';
import { InputProductionStats } from '@src/domain/computed/production';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { SetCover } from '@src/services/set-cover/set-cover';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { IngredientSet, pokemon } from 'sleepapi-common';
import { getAllIngredientCombinationsForLevel } from '../ingredient/ingredient-calculate';
import { getOptimalStats } from '../stats/stats-calculator';

export function calculateOptimalProductionForSetCover(input: InputProductionStats, monteCarloIterations: number) {
  const { level, berries, nature } = input;
  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];

  const pokemonWithCorrectBerries = pokemon.OPTIMAL_POKEDEX.filter((pokemon) => berries.includes(pokemon.berry));
  for (const pokemon of pokemonWithCorrectBerries) {
    const optimalStats: CustomStats = getOptimalStats(level, pokemon);
    const customStats: CustomStats = {
      level,
      nature: nature ?? optimalStats.nature,
      subskills: input.subskills ?? optimalStats.subskills,
      skillLevel: input.skillLevel ?? pokemon.skill.maxLevel,
    };

    let preGeneratedSkillActivations: SkillActivation[] | undefined = undefined;
    for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
      // TODO: when we add helperBoost to frontend team finder we should add class param in set-cover to exclude helperboost mon if present in team input
      const { detailedProduce, averageProduce, skillActivations } = setupAndRunProductionSimulation({
        pokemonCombination: {
          pokemon: pokemon,
          ingredientList,
        },
        input: {
          ...input,
          ...customStats,
        },
        monteCarloIterations,
        preGeneratedSkillActivations,
      });

      preGeneratedSkillActivations = skillActivations;
      pokemonProduction.push({
        pokemonCombination: {
          pokemon,
          ingredientList,
        },
        detailedProduce,
        averageProduce,
        customStats,
      });
    }
  }

  return pokemonProduction;
}

export function calculateSetCover(params: {
  recipe: IngredientSet[];
  cache: Map<string, CustomPokemonCombinationWithProduce[][]>;
  reverseIndex: Map<string, CustomPokemonCombinationWithProduce[]>;
  maxTeamSize?: number;
  timeout?: number;
}) {
  const { recipe, cache, reverseIndex, maxTeamSize, timeout } = params;

  const setCover = new SetCover(reverseIndex, cache);
  return setCover.findOptimalCombinationFor(recipe, [], maxTeamSize, timeout);
}
