import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import type {
  CalculateTeamResponse,
  Pokemon,
  PokemonWithIngredients,
  TeamMember,
  TeamMemberSettings,
  TeamSettings
} from 'sleepapi-common';
import {
  ALL_BERRY_SPECIALISTS,
  ALL_INGREDIENT_SPECIALISTS,
  CarrySizeUtils,
  EnergizingCheerS,
  EnergyForEveryoneS,
  ExtraHelpfulS,
  HelperBoost,
  nature,
  OPTIMAL_SKILL_SPECIALISTS,
  subskill
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';
import { TeamSimulator } from './team-simulator.js';

const isBenchmarking = process.env.MODE === 'benchmarking';

const energySupportPokemon: Pokemon[] = OPTIMAL_SKILL_SPECIALISTS.filter((pokemon) =>
  pokemon.skill.isOrModifies(EnergyForEveryoneS, EnergizingCheerS)
);

const helpSupportPokemon: Pokemon[] = OPTIMAL_SKILL_SPECIALISTS.filter((pokemon) =>
  pokemon.skill.isOrModifies(ExtraHelpfulS, HelperBoost)
);

const primaryPokemon: Pokemon[] = ALL_BERRY_SPECIALISTS.concat(ALL_INGREDIENT_SPECIALISTS);

const rng: PreGeneratedRandom = createPreGeneratedRandom();

function randomPokemonWithIngredients(options: Pokemon[]): PokemonWithIngredients {
  const pokemon = rng.randomElement(options);
  return {
    pokemon: pokemon,
    ingredientList: [
      rng.randomElement(pokemon.ingredient0),
      rng.randomElement(pokemon.ingredient30),
      rng.randomElement(pokemon.ingredient60)
    ]
  };
}

function randomTeamMemberSettings(pokemon: Pokemon): TeamMemberSettings {
  return {
    level: (rng.getUint8() % 100) + 1,
    nature: rng.randomElement(nature.NATURES),
    subskills: new Set([
      rng.randomElement(subskill.SUBSKILLS).name,
      rng.randomElement(subskill.SUBSKILLS).name,
      rng.randomElement(subskill.SUBSKILLS).name,
      rng.randomElement(subskill.SUBSKILLS).name,
      rng.randomElement(subskill.SUBSKILLS).name
    ]),
    skillLevel: (rng.getUint8() % pokemon.skill.maxLevel) + 1,
    carrySize: CarrySizeUtils.baseCarrySize(pokemon),
    ribbon: 0,
    externalId: 'something' + rng.getUint8() + rng.getUint8() + rng.getUint8() + rng.getUint8() + rng.getUint8(),
    sneakySnacking: false
  };
}

function randomTeamMember(options: Pokemon[]): TeamMember {
  const pokemonWithIngredients = randomPokemonWithIngredients(options);
  const settings = randomTeamMemberSettings(pokemonWithIngredients.pokemon);
  return {
    pokemonWithIngredients,
    settings
  };
}

function randomTeam(): TeamMember[] {
  return [
    randomTeamMember(primaryPokemon),
    randomTeamMember(primaryPokemon),
    randomTeamMember(primaryPokemon),
    randomTeamMember(energySupportPokemon),
    randomTeamMember(helpSupportPokemon)
  ];
}

// 5110 days is 14 years or 730 weeks
const simulationDays = 5110;

const mockSettings: TeamSettings = mocks.teamSettings({ includeCooking: true });

describe.runIf(isBenchmarking)('TeamSimulatorBenchmark', () => {
  it(
    'shall time 5000 team simulations',
    () => {
      const benchmarkIterations = 5000;

      const startTime = new Date().getTime();

      for (let i = 0; i < benchmarkIterations; ++i) {
        const simulator = new TeamSimulator({
          settings: mockSettings,
          members: randomTeam(),
          iterations: simulationDays
        });
        simulator.simulate;
      }

      const endTime = new Date().getTime();
      const duration = endTime - startTime;

      expect(duration).toMatchSnapshot();
    },
    60 * 1000 // 1 minute
  );

  it('shall observe production for 5 team simulations', () => {
    const results: CalculateTeamResponse[] = [];
    const benchmarkIterations = 5;

    for (let i = 0; i < benchmarkIterations; ++i) {
      const simulator = new TeamSimulator({
        settings: mockSettings,
        members: randomTeam(),
        iterations: simulationDays
      });
      simulator.simulate;
      results.push(simulator.results());
    }

    expect(results).toMatchSnapshot();
  });
});
