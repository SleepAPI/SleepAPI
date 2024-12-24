import type { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom';
import type { SetCoverProductionStats } from '@src/domain/computed/production';
import { SetCover } from '@src/services/set-cover/set-cover';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import type { IngredientSet, SkillActivation } from 'sleepapi-common';
import { mainskill, pokemon } from 'sleepapi-common';
import { getAllIngredientCombinationsForLevel } from '../ingredient/ingredient-calculate';
import { getOptimalStats } from '../stats/stats-calculator';

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
