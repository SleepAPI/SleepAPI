import type { TeamMember, TeamSettingsExt } from '@src/domain/combination/team.js';
import type { ProductionStats } from '@src/domain/computed/production.js';
import { getAllIngredientCombinationsForLevel } from '@src/services/calculator/ingredient/ingredient-calculate.js';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service.js';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator.js';
import { getIngredientSet } from '@src/utils/production-utils/production-utils.js';
import { limitSubSkillsToLevel } from '@src/utils/subskill-utils/subskill-utils.js';
import type { CalculateIvResponse, DetailedProduce, MemberProductionBase, pokemon } from 'sleepapi-common';
import { maxCarrySize, nature, subskill } from 'sleepapi-common';

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
    monteCarloIterations
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
        skillLevel: 1
      },
      monteCarloIterations
    }).detailedProduce;

    const optimalIngredientSubskills = limitSubSkillsToLevel(
      [
        subskill.INGREDIENT_FINDER_M,
        subskill.HELPING_SPEED_M,
        subskill.INGREDIENT_FINDER_S,
        subskill.INVENTORY_L,
        subskill.HELPING_SPEED_S
      ],
      input.level
    );
    optimalIngredientProduction = setupAndRunProductionSimulation({
      pokemonCombination,
      input: {
        ...input,
        subskills: optimalIngredientSubskills,
        nature: nature.QUIET,
        skillLevel: pokemon.skill.maxLevel,
        inventoryLimit: maxCarrySize(pokemon)
      },
      monteCarloIterations
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
            subskill.SKILL_TRIGGER_M
          ],
          input.level
        ),
        nature: nature.ADAMANT,
        skillLevel: pokemon.skill.maxLevel,
        inventoryLimit: pokemon.carrySize
      },
      monteCarloIterations
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
            subskill.HELPING_BONUS
          ],
          input.level
        ),
        nature: nature.CAREFUL,
        skillLevel: pokemon.skill.maxLevel,
        inventoryLimit: maxCarrySize(pokemon)
      },
      monteCarloIterations
    }).detailedProduce;
  }

  // TODO: the filters and the pokemonCombination can we removed with Sleep API 2
  return {
    filters: input,
    production: {
      pokemonCombination: { pokemon, ingredientList },
      detailedProduce
    },
    log,
    summary,
    neutralProduction,
    optimalIngredientProduction,
    optimalBerryProduction,
    optimalSkillProduction
  };
}

// 5110 days is 14 years or 730 weeks
export function calculateTeam(params: { settings: TeamSettingsExt; members: TeamMember[] }, iterations = 5110) {
  const { settings, members } = params;
  const teamSimulator = new TeamSimulator({ settings, members, includeCooking: true });

  for (let i = 0; i < iterations; i++) {
    teamSimulator.simulate();
  }

  return teamSimulator.results();
}

export function calculateIv(
  params: { settings: TeamSettingsExt; members: TeamMember[]; variants: TeamMember[] },
  iterations = 1400
): CalculateIvResponse {
  const { settings, members, variants } = params;

  const variantResults: MemberProductionBase[] = [];
  for (const variant of variants) {
    const teamWithVariant = [variant, ...members];
    const teamSimulator = new TeamSimulator({ settings, members: teamWithVariant, includeCooking: false });

    for (let i = 0; i < iterations; i++) {
      teamSimulator.simulate();
    }

    variantResults.push(teamSimulator.ivResults(variant.externalId));
  }

  return { variants: variantResults };
}
