import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import type {
  CalculateTeamResponse,
  Pokemon,
  PokemonWithIngredients,
  TeamMemberExt,
  TeamMemberSettingsExt,
  TeamSettingsExt
} from 'sleepapi-common';
import { CarrySizeUtils, hasSpecialty, nature, OPTIMAL_POKEDEX, subskill } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';
import { TeamSimulator } from './team-simulator.js';

const isBenchmarking = process.env.MODE === 'benchmarking';

const energySupportPokemon: Pokemon[] = OPTIMAL_POKEDEX.filter((pokemon) => pokemon.skill.hasUnit('energy'));

const helpSupportPokemon: Pokemon[] = OPTIMAL_POKEDEX.filter((pokemon) => pokemon.skill.hasUnit('helps'));

const primaryPokemon: Pokemon[] = OPTIMAL_POKEDEX.filter(
  (pokemon) => hasSpecialty(pokemon, 'berry') || hasSpecialty(pokemon, 'ingredient')
);

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

function randomTeamMemberSettings(pokemon: Pokemon): TeamMemberSettingsExt {
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

function randomTeamMember(options: Pokemon[]): TeamMemberExt {
  const pokemonWithIngredients = randomPokemonWithIngredients(options);
  const settings = randomTeamMemberSettings(pokemonWithIngredients.pokemon);
  return {
    pokemonWithIngredients,
    settings
  };
}

function randomTeam(): TeamMemberExt[] {
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

const mockSettings: TeamSettingsExt = mocks.teamSettingsExt({ includeCooking: true });

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
