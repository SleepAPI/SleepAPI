import type { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom.js';
import type { SetCoverProductionStats } from '@src/domain/computed/production.js';
import { getAllIngredientCombinationsForLevel } from '@src/services/calculator/ingredient/ingredient-calculate.js';
import { getOptimalStats } from '@src/services/calculator/stats/stats-calculator.js';
import { SetCover } from '@src/services/set-cover/set-cover.js';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service.js';
import type { IngredientSet, SkillActivation } from 'sleepapi-common';
import { mainskill, pokemon } from 'sleepapi-common';

export function calculateOptimalProductionForSetCover(input: SetCoverProductionStats, monteCarloIterations: number) {
  const { level, berries, nature } = input;
  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];

  const pokemonWithCorrectBerries = pokemon.OPTIMAL_POKEDEX.filter((pokemon) => berries.includes(pokemon.berry));
  for (const pokemon of pokemonWithCorrectBerries) {
    const optimalStats: CustomStats = getOptimalStats(level, pokemon);
    const customStats: CustomStats = {
      level,
      ribbon: input.ribbon ?? optimalStats.ribbon,
      nature: nature ?? optimalStats.nature,
      subskills: input.subskills ?? optimalStats.subskills,
      skillLevel: input.skillLevel ?? pokemon.skill.maxLevel,
      inventoryLimit: optimalStats.inventoryLimit
    };

    let preGeneratedSkillActivations: SkillActivation[] | undefined = undefined;
    for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
      const { detailedProduce, averageProduce, skillActivations } = setupAndRunProductionSimulation({
        pokemonCombination: {
          pokemon: pokemon,
          ingredientList
        },
        input: {
          ...input,
          ...customStats
        },
        monteCarloIterations,
        preGeneratedSkillActivations
      });

      // if each ing set gives different skill result we dont cache, other skills can cache
      const diffSkillResultForDiffIngSets = [
        mainskill.HELPER_BOOST,
        mainskill.EXTRA_HELPFUL_S,
        mainskill.METRONOME
      ].includes(pokemon.skill);
      preGeneratedSkillActivations = diffSkillResultForDiffIngSets ? undefined : skillActivations;
      pokemonProduction.push({
        pokemonCombination: {
          pokemon,
          ingredientList
        },
        detailedProduce,
        averageProduce,
        customStats
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
