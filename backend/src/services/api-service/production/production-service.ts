import type { ProductionStats } from '@src/domain/computed/production.js';
import { getAllIngredientLists } from '@src/services/calculator/ingredient/ingredient-calculate.js';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service.js';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator.js';
import { getIngredientSet } from '@src/utils/production-utils/production-utils.js';
import type {
  CalculateIvResponse,
  DetailedProduce,
  MemberProductionBase,
  Pokemon,
  TeamMemberExt,
  TeamSettingsExt
} from 'sleepapi-common';
import { limitSubSkillsToLevel, maxCarrySize, nature, subskill } from 'sleepapi-common';

export function calculatePokemonProduction(
  pokemon: Pokemon,
  input: ProductionStats,
  ingredientSet: string[],
  includeAnalysis: boolean,
  monteCarloIterations: number
) {
  const allIngredientSets = getAllIngredientLists(pokemon, input.level);
  const ingredientList = getIngredientSet(allIngredientSets, ingredientSet);
  const pokemonCombination = { pokemon, ingredientList };

  // calculate user's input
  const { detailedProduce, log, summary } = setupAndRunProductionSimulation({
    pokemonSet: pokemonCombination,
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
      pokemonSet: pokemonCombination,
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
      pokemonSet: pokemonCombination,
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
      pokemonSet: pokemonCombination,
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
        inventoryLimit: pokemon.carrySize
      },
      monteCarloIterations
    }).detailedProduce;

    optimalSkillProduction = setupAndRunProductionSimulation({
      pokemonSet: pokemonCombination,
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
export function calculateTeam(
  params: { settings: TeamSettingsExt; members: TeamMemberExt[] },
  iterations = 5110,
  includeCooking = true
) {
  const { settings, members } = params;

  const teamSimulator = new TeamSimulator({ settings, members, includeCooking });

  for (let i = 0; i < iterations; i++) {
    teamSimulator.simulate();
  }

  return teamSimulator.results();
}

// TODO: could tweak iterations
export function calculateSimple(
  params: { settings: TeamSettingsExt; members: TeamMemberExt[]; includeCooking: boolean },
  iterations = 700
) {
  const { settings, members, includeCooking } = params;
  const teamSimulator = new TeamSimulator({
    settings,
    members,
    includeCooking: includeCooking === true
  });

  for (let i = 0; i < iterations; i++) {
    teamSimulator.simulate();
  }

  return teamSimulator.simpleResults();
}

export function calculateIv(
  params: { settings: TeamSettingsExt; members: TeamMemberExt[]; variants: TeamMemberExt[] },
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

    variantResults.push(teamSimulator.ivResults(variant.settings.externalId));
  }

  return { variants: variantResults };
}
