import type { ProductionStats } from '@src/domain/computed/production.js';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service.js';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import type { UserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator.js';
import { getIngredientSet } from '@src/utils/production-utils/production-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type {
  CalculateIvResponse,
  DetailedProduce,
  MemberProductionBase,
  Pokemon,
  TeamMember,
  TeamSettings
} from 'sleepapi-common';
import { CarrySizeUtils, getAllIngredientLists, limitSubSkillsToLevel, nature, subskill } from 'sleepapi-common';

// TODO: remove in Sleep API 2.0
export function calculatePokemonProduction(
  pokemon: Pokemon,
  input: ProductionStats,
  ingredientSet: string[],
  includeAnalysis: boolean,
  monteCarloIterations: number
) {
  const allIngredientSets = getAllIngredientLists(pokemon, input.level);
  const ingredientList = getIngredientSet(allIngredientSets, ingredientSet);
  const pokemonSet = { pokemon, ingredientList };

  // calculate user's input
  const { detailedProduce, log, summary } = setupAndRunProductionSimulation({
    pokemonSet,
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
      pokemonSet,
      input: {
        ...input,
        subskills: new Set(),
        nature: nature.BASHFUL,
        skillLevel: 1
      },
      monteCarloIterations
    }).detailedProduce;

    const optimalIngredientSubskills = limitSubSkillsToLevel(
      new Set([
        subskill.INGREDIENT_FINDER_M.name,
        subskill.HELPING_SPEED_M.name,
        subskill.INGREDIENT_FINDER_S.name,
        subskill.INVENTORY_L.name,
        subskill.HELPING_SPEED_S.name
      ]),
      input.level
    );
    optimalIngredientProduction = setupAndRunProductionSimulation({
      pokemonSet,
      input: {
        ...input,
        subskills: optimalIngredientSubskills,
        nature: nature.QUIET,
        skillLevel: pokemon.skill.maxLevel,
        inventoryLimit: CarrySizeUtils.baseCarrySize(pokemon)
      },
      monteCarloIterations
    }).detailedProduce;

    optimalBerryProduction = setupAndRunProductionSimulation({
      pokemonSet,
      input: {
        ...input,
        subskills: limitSubSkillsToLevel(
          new Set([
            subskill.BERRY_FINDING_S.name,
            subskill.HELPING_SPEED_M.name,
            subskill.HELPING_SPEED_S.name,
            subskill.HELPING_BONUS.name,
            subskill.SKILL_TRIGGER_M.name
          ]),
          input.level
        ),
        nature: nature.ADAMANT,
        skillLevel: pokemon.skill.maxLevel,
        inventoryLimit: CarrySizeUtils.baseCarrySize(pokemon)
      },
      monteCarloIterations
    }).detailedProduce;

    optimalSkillProduction = setupAndRunProductionSimulation({
      pokemonSet,
      input: {
        ...input,
        subskills: limitSubSkillsToLevel(
          new Set([
            subskill.SKILL_TRIGGER_M.name,
            subskill.HELPING_SPEED_M.name,
            subskill.SKILL_TRIGGER_S.name,
            subskill.HELPING_SPEED_S.name,
            subskill.HELPING_BONUS.name
          ]),
          input.level
        ),
        nature: nature.CAREFUL,
        skillLevel: pokemon.skill.maxLevel,
        inventoryLimit: CarrySizeUtils.baseCarrySize(pokemon)
      },
      monteCarloIterations
    }).detailedProduce;
  }

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
export function calculateTeam(
  params: { settings: TeamSettings; members: TeamMember[]; userRecipes: UserRecipes },
  iterations = 5110
) {
  const { settings, members, userRecipes } = params;

  const rng: PreGeneratedRandom = createPreGeneratedRandom();
  const cookingState = settings.includeCooking ? new CookingState(settings, userRecipes, rng) : undefined;
  const teamSimulator = new TeamSimulator({ settings, members, cookingState, iterations, rng });

  for (let i = 0; i < iterations; i++) {
    teamSimulator.simulate();
  }

  return teamSimulator.results();
}

export function calculateSimple(
  params: { settings: TeamSettings; members: TeamMember[]; userRecipes: UserRecipes },
  iterations = 700
) {
  const { settings, members, userRecipes } = params;

  const rng: PreGeneratedRandom = createPreGeneratedRandom();
  const cookingState = settings.includeCooking ? new CookingState(settings, userRecipes, rng) : undefined;
  const teamSimulator = new TeamSimulator({
    settings,
    members,
    cookingState,
    iterations,
    rng
  });

  for (let i = 0; i < iterations; i++) {
    teamSimulator.simulate();
  }

  return teamSimulator.simpleResults();
}

export function calculateIv(
  params: { settings: TeamSettings; members: TeamMember[]; variants: TeamMember[] },
  iterations = 1400
): CalculateIvResponse {
  const { settings, members, variants } = params;

  const rng: PreGeneratedRandom = createPreGeneratedRandom();
  const variantResults: MemberProductionBase[] = [];
  for (const variant of variants) {
    const teamWithVariant = [variant, ...members];
    const teamSimulator = new TeamSimulator({ settings, members: teamWithVariant, iterations, rng });

    for (let i = 0; i < iterations; i++) {
      teamSimulator.simulate();
    }

    variantResults.push(teamSimulator.ivResults(variant.settings.externalId));
  }

  return { variants: variantResults };
}
