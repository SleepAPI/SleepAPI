import { DetailedProduce } from '@src/domain/combination/produce';
import { TeamMember, TeamSettings } from '@src/domain/combination/team';
import { ProductionStats } from '@src/domain/computed/production';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator';
import { getIngredientSet } from '@src/utils/production-utils/production-utils';
import { limitSubSkillsToLevel } from '@src/utils/subskill-utils/subskill-utils';
import { nature, pokemon, subskill } from 'sleepapi-common';
import { getAllIngredientCombinationsForLevel } from '../../calculator/ingredient/ingredient-calculate';

export function calculatePokemonProduction(
  pokemon: pokemon.Pokemon,
  input: ProductionStats,
  ingredientSet: string[],
  includeAnalysis: boolean,
  monteCarloIterations: number
) {
  const allIngredientSets = getAllIngredientCombinationsForLevel(pokemon, input.level);
  const ingredientList = getIngredientSet(allIngredientSets, ingredientSet);
  const pokemonCombination = { pokemon, ingredientList };

  // calculate user's input
  const { detailedProduce, log, summary } = setupAndRunProductionSimulation({
    pokemonCombination,
    input,
    monteCarloIterations,
  });

  // calculate neutral and optimal setups for performance analysis
  let neutralProduction: DetailedProduce | undefined = undefined;
  let optimalIngredientProduction: DetailedProduce | undefined = undefined;
  let optimalBerryProduction: DetailedProduce | undefined = undefined;
  let optimalSkillProduction: DetailedProduce | undefined = undefined;
  if (includeAnalysis) {
    neutralProduction = setupAndRunProductionSimulation({
      pokemonCombination,
      input: {
        ...input,
        subskills: [],
        nature: nature.BASHFUL,
        skillLevel: 1,
      },
      monteCarloIterations,
    }).detailedProduce;

    optimalIngredientProduction = setupAndRunProductionSimulation({
      pokemonCombination,
      input: {
        ...input,
        subskills: limitSubSkillsToLevel(
          [
            subskill.INGREDIENT_FINDER_M,
            subskill.HELPING_SPEED_M,
            subskill.INGREDIENT_FINDER_S,
            subskill.INVENTORY_L,
            subskill.HELPING_SPEED_S,
          ],
          input.level
        ),
        nature: nature.QUIET,
        skillLevel: pokemon.skill.maxLevel,
        maxCarrySize: pokemon.maxCarrySize,
      },
      monteCarloIterations,
    }).detailedProduce;

    optimalBerryProduction = setupAndRunProductionSimulation({
      pokemonCombination,
      input: {
        ...input,
        subskills: limitSubSkillsToLevel(
          [
            subskill.BERRY_FINDING_S,
            subskill.HELPING_SPEED_M,
            subskill.HELPING_SPEED_S,
            subskill.HELPING_BONUS,
            subskill.SKILL_TRIGGER_M,
          ],
          input.level
        ),
        nature: nature.ADAMANT,
        skillLevel: pokemon.skill.maxLevel,
        maxCarrySize: pokemon.maxCarrySize,
      },
      monteCarloIterations,
    }).detailedProduce;

    optimalSkillProduction = setupAndRunProductionSimulation({
      pokemonCombination,
      input: {
        ...input,
        subskills: limitSubSkillsToLevel(
          [
            subskill.SKILL_TRIGGER_M,
            subskill.HELPING_SPEED_M,
            subskill.SKILL_TRIGGER_S,
            subskill.HELPING_SPEED_S,
            subskill.HELPING_BONUS,
          ],
          input.level
        ),
        nature: nature.SASSY,
        skillLevel: pokemon.skill.maxLevel,
        maxCarrySize: pokemon.maxCarrySize,
      },
      monteCarloIterations,
    }).detailedProduce;
  }

  return {
    filters: input,
    production: {
      pokemonCombination: { pokemon, ingredientList },
      detailedProduce,
    },
    log,
    summary,
    neutralProduction,
    optimalIngredientProduction,
    optimalBerryProduction,
    optimalSkillProduction,
  };
}

// TODO: test, but need to pull in iterations elsewhere, want to do that anyway
export async function calculateTeam(params: { settings: TeamSettings; members: TeamMember[] }) {
  const { settings, members } = params;
  const teamSimulator = new TeamSimulator({ settings, members });

  const iterations = 5000;

  for (let i = 0; i < iterations; i++) {
    teamSimulator.simulate();
  }

  return teamSimulator.results();
}
