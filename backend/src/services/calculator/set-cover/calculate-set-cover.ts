import { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom';
import { InputProductionStats } from '@src/domain/computed/production';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { SetCover } from '@src/services/set-cover/set-cover';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { subskillsForFilter } from '@src/utils/subskill-utils/subskill-utils';
import { IngredientSet, pokemon } from 'sleepapi-common';
import { getAllIngredientCombinationsForLevel } from '../ingredient/ingredient-calculate';

export function calculateOptimalProductionForSetCover(
  productionStats: InputProductionStats,
  monteCarloIterations: number
) {
  const { level, nature, subskills, berries, skillLevel } = productionStats;
  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];

  const pokemonWithCorrectBerries = pokemon.OPTIMAL_POKEDEX.filter((pokemon) => berries.includes(pokemon.berry));
  for (const pokemon of pokemonWithCorrectBerries) {
    const subskillsForPokemon = subskills ?? subskillsForFilter('optimal', level, pokemon);

    let preGeneratedSkillActivations: SkillActivation[] | undefined = undefined;
    for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
      const customStats: CustomStats = {
        level,
        nature,
        subskills: subskillsForPokemon,
        skillLevel,
      };
      const { detailedProduce, skillActivations } = setupAndRunProductionSimulation({
        pokemonCombination: {
          pokemon: pokemon,
          ingredientList,
        },
        input: {
          ...productionStats,
          subskills: subskillsForPokemon,
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
  return setCover.findOptimalCombinationFor(recipe, maxTeamSize, timeout);
}
