/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  SkillActivation,
  TeamActivationValue,
  UnitActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator.js';
import { mocks } from '@src/vitest/index.js';
import type { Berry, PokemonSpecialty, PokemonWithIngredients, TeamMember, TeamSettings } from 'sleepapi-common';
import {
  BASE_FAVORED_BERRY_MULTIPLIER,
  BerryBurstDisguise,
  ChargeStrengthS,
  EXPERT_MODE_BERRY_BONUS_MULTIPLIER,
  EnergyForEveryoneS,
  MathUtils,
  PINSIR,
  RandomUtils,
  berry,
  calculatePityProcThreshold,
  commonMocks,
  ingredient,
  nature,
  parseTime,
  subskill
} from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';

const mockPokemonWithIngredients: PokemonWithIngredients = {
  pokemon: commonMocks.mockPokemon({
    carrySize: 10,
    frequency: 3600,
    ingredient0: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient30: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredientPercentage: 20,
    skill: ChargeStrengthS,
    skillPercentage: 100,
    specialty: 'skill'
  }),
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }
  ]
};
const mockSettings: TeamSettings = mocks.teamSettings({ includeCooking: true });
const mockMembers: TeamMember[] = [
  {
    pokemonWithIngredients: mockPokemonWithIngredients,
    settings: {
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: new Set(),
      externalId: 'some id',
      sneakySnacking: false
    }
  }
];

describe('TeamSimulator', () => {
  it('shall return expected production from mocked pokemon', () => {
    const simulator = new TeamSimulator({ settings: mockSettings, members: mockMembers, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal.berries[0].amount).toMatchInlineSnapshot(`37`);
    expect(result.members[0].produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`8`);
    expect(result.members[0].advanced.morningProcs).toBe(2);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`35`);
  });

  it('shall return expected variant production from mocked pokemon', () => {
    const simulator = new TeamSimulator({ settings: mockSettings, members: mockMembers, iterations: 1 });

    simulator.simulate();

    const result = simulator.ivResults(mockMembers[0].settings.externalId);

    expect(result.produceTotal.berries[0].amount).toMatchInlineSnapshot(`37`);
    expect(result.produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`8`);
    expect(result.skillProcs).toMatchInlineSnapshot(`35`);
  });

  it('shall calculate production with uneven sleep times', () => {
    const settings: TeamSettings = mocks.teamSettings({
      includeCooking: true,
      wakeup: parseTime('06:01')
    });

    const members: TeamMember[] = [
      {
        pokemonWithIngredients: {
          pokemon: PINSIR,
          ingredientList: [
            { amount: 2, ingredient: ingredient.HONEY },
            { amount: 5, ingredient: ingredient.HONEY },
            { amount: 7, ingredient: ingredient.HONEY }
          ]
        },
        settings: {
          carrySize: 24,
          level: 60,
          ribbon: 0,
          nature: nature.MILD,
          skillLevel: 6,
          subskills: new Set([subskill.INGREDIENT_FINDER_M.name]),
          externalId: 'some id',
          sneakySnacking: false
        }
      }
    ];
    const simulator = new TeamSimulator({ settings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal.berries[0].amount).toBeCloseTo(42);
    expect(result.members[0].produceTotal.ingredients[0].amount).toBeCloseTo(96);
  });

  it('shall calculate team with multiple members', () => {
    const mockMember: TeamMember = {
      pokemonWithIngredients: mockPokemonWithIngredients,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id',
        sneakySnacking: false
      }
    };

    const members: TeamMember[] = [mockMember, mockMember, mockMember, mockMember, mockMember];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(5);

    expect(result.members[0].produceTotal.berries[0].amount).toEqual(38);
    expect(result.members[0].produceTotal.ingredients[0].amount).toEqual(7);
    expect(result.members[0].skillProcs).toEqual(35);

    expect(result.members[1].produceTotal.berries[0].amount).toEqual(33);
    expect(result.members[1].produceTotal.ingredients[0].amount).toEqual(12);
    expect(result.members[1].skillProcs).toEqual(35);

    expect(result.members[2].produceTotal.berries[0].amount).toEqual(37);
    expect(result.members[2].produceTotal.ingredients[0].amount).toEqual(8);
    expect(result.members[2].skillProcs).toEqual(35);

    expect(result.members[3].produceTotal.berries[0].amount).toEqual(37);
    expect(result.members[3].produceTotal.ingredients[0].amount).toEqual(8);
    expect(result.members[3].skillProcs).toEqual(35);

    expect(result.members[4].produceTotal.berries[0].amount).toEqual(38);
    expect(result.members[4].produceTotal.ingredients[0].amount).toEqual(7);
    expect(result.members[4].skillProcs).toEqual(35);
  });

  it('team members shall affect each other', () => {
    const mockMember: TeamMember = {
      pokemonWithIngredients: mockPokemonWithIngredients,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id',
        sneakySnacking: false
      }
    };
    const mockMemberSupportPokemon = {
      ...mockPokemonWithIngredients.pokemon,
      skillPercentage: 100,
      skill: EnergyForEveryoneS
    };
    const mockMemberSupport: TeamMember = {
      pokemonWithIngredients: {
        ...mockPokemonWithIngredients,
        pokemon: mockMemberSupportPokemon
      },
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id',
        sneakySnacking: false
      }
    };

    const members: TeamMember[] = [mockMember, mockMemberSupport];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(2);

    expect(result.members[0].produceTotal.berries[0].amount).toMatchInlineSnapshot(`50`);
    expect(result.members[0].produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`11`);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`42`);
  });

  it('shall count wasted energy', () => {
    const mockMemberSupportPokemon = {
      ...mockPokemonWithIngredients.pokemon,
      skillPercentage: 100,
      skill: EnergyForEveryoneS
    };
    const mockMemberSupport: TeamMember = {
      pokemonWithIngredients: {
        ...mockPokemonWithIngredients,
        pokemon: mockMemberSupportPokemon
      },
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.ADAMANT,
        skillLevel: EnergyForEveryoneS.maxLevel,
        subskills: new Set([subskill.HELPING_SPEED_M.name]),
        externalId: 'some id',
        sneakySnacking: false
      }
    };

    const members: TeamMember[] = [
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(5);
    const skillAmount = MathUtils.round(result.members[0].skillAmount, 1);
    const wasteAmount = MathUtils.round(result.members[0].advanced.wastedEnergy, 1);
    expect(skillAmount).toMatchInlineSnapshot(`726.5`);
    expect(wasteAmount).toMatchInlineSnapshot(`4070`);
    expect(
      5 *
        result.members[0].skillProcs *
        EnergyForEveryoneS.activations.energy.amount({ skillLevel: EnergyForEveryoneS.maxLevel })
    ).toEqual(skillAmount + wasteAmount);
  });

  it('shall give pity procs when threshold met', () => {
    const mockMember = {
      ...mockPokemonWithIngredients,
      pokemon: {
        ...mockPokemonWithIngredients.pokemon,
        frequency: 3000,
        skillPercentage: 0,
        pityProcThreshold: calculatePityProcThreshold('skill', 3000)
      }
    };
    const members: TeamMember[] = [
      {
        pokemonWithIngredients: mockMember,
        settings: {
          carrySize: 10,
          level: 60,
          ribbon: 0,
          nature: nature.BASHFUL,
          skillLevel: 6,
          subskills: new Set(),
          externalId: 'some id',
          sneakySnacking: false
        }
      }
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();
    expect(result.members).toHaveLength(1);
    const member = result.members[0];

    const helpsBeforeSS = member.advanced.dayHelps + member.advanced.nightHelpsBeforeSS;
    const pityProcThreshold = mockMember.pokemon.pityProcThreshold;
    const expectedPityProcs = Math.floor(helpsBeforeSS / pityProcThreshold);

    expect(helpsBeforeSS).toMatchInlineSnapshot(`49`);
    expect(pityProcThreshold).toMatchInlineSnapshot(`48`);
    expect(expectedPityProcs).toMatchInlineSnapshot(`1`);

    expect(member.skillProcs).toMatchInlineSnapshot(`1`);
  });

  it('shall only allow 1 disguise crit until sleep reset', () => {
    const spy = vimic(RandomUtils, 'roll', () => true);

    const disguisePokemon = {
      ...commonMocks.mockPokemon(),
      skill: BerryBurstDisguise,
      // one help every ~12 hours, final x2 multiplication is to account for energy frequency
      frequency: 60 * 60 * 12 * 2,
      // 100% chance to activate skill per help
      skillPercentage: 100
    };
    const members: TeamMember[] = [
      {
        pokemonWithIngredients: {
          ...mockPokemonWithIngredients,
          pokemon: disguisePokemon
        },
        settings: {
          carrySize: 10,
          level: 1,
          ribbon: 0,
          nature: nature.BASHFUL,
          skillLevel: 6,
          subskills: new Set(),
          externalId: 'some id',
          sneakySnacking: false
        }
      }
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, iterations: 1 });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].skillProcs).toBe(2);
    expect(result.members[0].produceFromSkill.berries).toHaveLength(1);
    const amountPerProc = BerryBurstDisguise.activations.berries.amount({ skillLevel: 6 });
    expect(result.members[0].produceFromSkill.berries[0].amount).toBe(amountPerProc * 3 + amountPerProc);
    expect(result.members[0].produceFromSkill.berries[0].amount).toBe(84);

    spy.mockRestore();
  });

  describe('expert mode event modifiers', () => {
    const settings: TeamSettings = mocks.teamSettings({
      includeCooking: false,
      island: commonMocks.islandInstance({
        expert: true,
        berries: [berry.ORAN],
        expertMode: {
          mainFavoriteBerry: berry.ORAN,
          subFavoriteBerries: [berry.YACHE],
          randomBonus: 'skill'
        }
      })
    });

    const buildMember = (memberBerry: Berry): TeamMember => {
      const pokemon = commonMocks.mockPokemon({
        berry: memberBerry,
        frequency: 1800,
        skillPercentage: 0.2,
        skill: ChargeStrengthS,
        specialty: 'skill'
      });
      return {
        pokemonWithIngredients: {
          pokemon,
          ingredientList: [commonMocks.mockIngredientSet()]
        },
        settings: {
          carrySize: 10,
          level: 60,
          ribbon: 0,
          nature: nature.BASHFUL,
          skillLevel: 3,
          subskills: new Set(),
          sneakySnacking: false,
          externalId: 'event-test'
        }
      };
    };

    const runSimpleResults = (memberBerry: Berry) => {
      const simulator = new TeamSimulator({
        settings,
        members: [buildMember(memberBerry)],
        iterations: 1
      });
      simulator.simulate();
      return simulator.simpleResults()[0];
    };

    it('applies expert mode frequency and skill level modifiers based on favored status', () => {
      // member's ORAN is the main favorite: +1 skill level, 10% faster helps
      const favored = runSimpleResults(berry.ORAN);
      expect(favored.member.settings.skillLevel).toBe(4);
      expect(favored.member.pokemonWithIngredients.pokemon.frequency).toBeCloseTo(1620); // 1800 * 0.9

      // member's YACHE is the sub favorite: no effect on frequency or level
      const subFavored = runSimpleResults(berry.YACHE);
      expect(subFavored.member.settings.skillLevel).toBe(3);
      expect(subFavored.member.pokemonWithIngredients.pokemon.frequency).toBeCloseTo(1800);

      // member's MAGO is not favored: no skill level bonus, 15% slower helps
      const notFavored = runSimpleResults(berry.MAGO);
      expect(notFavored.member.settings.skillLevel).toBe(3);
      expect(notFavored.member.pokemonWithIngredients.pokemon.frequency).toBeCloseTo(2070); // 1800 * 1.15

      expect(favored.totalHelps).toBeGreaterThan(notFavored.totalHelps);
    });
  });

  describe('expert mode random bonus effects', () => {
    const buildExpertModeSettings = (params: {
      randomBonus: 'berry' | 'ingredient' | 'skill';
      areaBonus?: number;
    }): TeamSettings =>
      mocks.teamSettings({
        includeCooking: false,
        island: commonMocks.islandInstance({
          expert: true,
          berries: [berry.BELUE],
          areaBonus: params.areaBonus ?? 0,
          expertMode: {
            mainFavoriteBerry: berry.BELUE,
            subFavoriteBerries: [],
            randomBonus: params.randomBonus
          }
        })
      });

    const buildFavoredMember = (params: {
      carrySize: number;
      specialty: PokemonSpecialty;
      externalId: string;
    }): TeamMember => {
      const pokemon = commonMocks.mockPokemon({
        carrySize: params.carrySize,
        frequency: 3600,
        berry: berry.BELUE,
        ingredient0: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
        ingredient30: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
        ingredient60: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
        ingredientPercentage: 20,
        skill: ChargeStrengthS,
        skillPercentage: 20,
        specialty: params.specialty
      });
      return {
        pokemonWithIngredients: {
          pokemon,
          ingredientList: [
            { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
            { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
            { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }
          ]
        },
        settings: {
          carrySize: params.carrySize,
          level: 60,
          ribbon: 0,
          nature: nature.BASHFUL,
          skillLevel: 3,
          subskills: new Set(),
          externalId: params.externalId,
          sneakySnacking: false
        }
      };
    };

    it('expert mode berry bonus raises favored berry strength above the base favored multiplier and compounds with area bonus', () => {
      const member = buildFavoredMember({ carrySize: 10, specialty: 'berry', externalId: 'berry-bonus-test' });

      const runTotals = (randomBonus: 'berry' | 'skill') => {
        const simulator = new TeamSimulator({
          settings: buildExpertModeSettings({ randomBonus, areaBonus: 50 }),
          members: [member],
          iterations: 1
        });
        simulator.simulate();
        const res = simulator.results().members[0];
        return res.strength.berries;
      };

      // 'skill' bonus does not modify strength, so it acts as a baseline that still
      // applies the frequency/skill team mods so only the berry strength math differs.
      const baseline = runTotals('skill');
      const withBerry = runTotals('berry');

      // baseline favored multiplier is the base favored multiplier, then the area bonus compounds on top
      expect(baseline.breakdown.favored).toBeCloseTo(baseline.breakdown.base);
      expect(baseline.total).toBeCloseTo(BASE_FAVORED_BERRY_MULTIPLIER * 1.5 * baseline.breakdown.base);

      // with berry bonus the favored multiplier is the expert mode bonus multiplier and the area bonus compounds on top
      expect(withBerry.breakdown.favored).toBeCloseTo(
        (EXPERT_MODE_BERRY_BONUS_MULTIPLIER - BASE_FAVORED_BERRY_MULTIPLIER + 1) * withBerry.breakdown.base
      );
      expect(withBerry.breakdown.islandBonus).toBeCloseTo(
        EXPERT_MODE_BERRY_BONUS_MULTIPLIER * 0.5 * withBerry.breakdown.base
      );
      expect(withBerry.total).toBeCloseTo(EXPERT_MODE_BERRY_BONUS_MULTIPLIER * 1.5 * withBerry.breakdown.base);
    });

    it('expert mode ingredient bonus increases ingredients produced for favored-berry mon', () => {
      const member = buildFavoredMember({ carrySize: 20, specialty: 'ingredient', externalId: 'ing-bonus-test' });

      const runIngredients = (randomBonus: 'ingredient' | 'skill') => {
        const simulator = new TeamSimulator({
          settings: buildExpertModeSettings({ randomBonus }),
          members: [member],
          iterations: 1
        });
        simulator.simulate();
        const res = simulator.results().members[0];
        return res.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0);
      };

      const baseline = runIngredients('skill');
      const withIngredient = runIngredients('ingredient');

      expect(withIngredient).toBeGreaterThan(baseline);
    });
  });
});

describe('recoverMemberEnergy', () => {
  it("shall recover every member's energy", () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers),
      iterations: 1
    }) as any;

    const energy: TeamActivationValue = {
      crit: 0,
      regular: 50
    };

    simulator.recoverMemberEnergy(energy, simulator.memberStates[0], simulator.memberStates);

    simulator.memberStates.forEach((member: any) => {
      expect(member.energy).toBe(50);
    });
  });

  it('shall recover member energy', () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers),
      iterations: 1
    }) as any;
    simulator.memberStates[0].recoverEnergy(100, simulator.memberStates[0]);

    const energy: TeamActivationValue = {
      crit: 0,
      regular: 50
    };

    simulator.recoverMemberEnergy(energy, simulator.memberStates[0], [simulator.memberStates[1]]);
    expect(simulator.memberStates).toHaveLength(2);
    expect(simulator.memberStates[0].energy).toBe(100);
    expect(simulator.memberStates[1].energy).toBe(50);
  });

  it("shall recover some members' energy", () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers).concat(mockMembers),
      iterations: 1
    }) as any;

    const energy: TeamActivationValue = {
      crit: 0,
      regular: 50
    };

    simulator.recoverMemberEnergy(energy, simulator.memberStates[0], [
      simulator.memberStates[1],
      simulator.memberStates[2]
    ]);
    expect(simulator.memberStates).toHaveLength(3);
    expect(simulator.memberStates[0].energy).toBe(0);
    expect(simulator.memberStates[1].energy).toBe(50);
    expect(simulator.memberStates[2].energy).toBe(50);
  });
});

describe('processTeamEnergyActivation', () => {
  it('shall heal all members', () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers).concat(mockMembers),
      iterations: 1
    }) as any;

    simulator.memberStates[0].recoverEnergy(50, simulator.memberStates[0]);
    simulator.memberStates[1].recoverEnergy(30, simulator.memberStates[1]);
    simulator.memberStates[2].recoverEnergy(10, simulator.memberStates[2]);

    const energyActivation: UnitActivation = {
      unit: 'energy',
      team: {
        crit: 0,
        regular: 30
      }
    };

    simulator.processTeamEnergyActivation(energyActivation, simulator.memberStates[0], simulator.memberStates);
    expect(simulator.memberStates).toHaveLength(3);
    expect(simulator.memberStates[0].energy).toBe(80);
    expect(simulator.memberStates[1].energy).toBe(60);
    expect(simulator.memberStates[2].energy).toBe(40);
  });

  it('shall heal some members', () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers).concat(mockMembers),
      iterations: 1
    }) as any;

    simulator.memberStates[0].recoverEnergy(50, simulator.memberStates[0]);
    simulator.memberStates[1].recoverEnergy(30, simulator.memberStates[1]);
    simulator.memberStates[2].recoverEnergy(10, simulator.memberStates[2]);

    const energyActivation: UnitActivation = {
      unit: 'energy',
      team: {
        crit: 0,
        regular: 30
      }
    };

    simulator.processTeamEnergyActivation(energyActivation, simulator.memberStates[0], [
      simulator.memberStates[1],
      simulator.memberStates[2]
    ]);
    expect(simulator.memberStates).toHaveLength(3);
    expect(simulator.memberStates[0].energy).toBe(50);
    expect(simulator.memberStates[1].energy).toBe(60);
    expect(simulator.memberStates[2].energy).toBe(40);
  });
});

describe('maybeActivateTeamSkill (energy)', () => {
  it('shall heal all members without chanceToTargetLowest', () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers).concat(mockMembers),
      iterations: 1
    }) as any;

    simulator.memberStates[0].recoverEnergy(50, simulator.memberStates[0]);
    simulator.memberStates[1].recoverEnergy(30, simulator.memberStates[1]);
    simulator.memberStates[2].recoverEnergy(10, simulator.memberStates[2]);

    const energyActivation: SkillActivation = {
      skill: commonMocks.mockMainskill,
      activations: [
        {
          unit: 'energy',
          team: {
            crit: 0,
            regular: 30
          }
        }
      ]
    };

    simulator.maybeActivateTeamSkill(energyActivation, simulator.memberStates[0]);
    expect(simulator.memberStates).toHaveLength(3);
    expect(simulator.memberStates[0].energy).toBe(80);
    expect(simulator.memberStates[1].energy).toBe(60);
    expect(simulator.memberStates[2].energy).toBe(40);
  });

  it('shall heal lowest members with chanceToTargetLowest', () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers).concat(mockMembers),
      iterations: 1
    }) as any;

    simulator.memberStates[0].recoverEnergy(50, simulator.memberStates[0]);
    simulator.memberStates[1].recoverEnergy(30, simulator.memberStates[1]);
    simulator.memberStates[2].recoverEnergy(10, simulator.memberStates[2]);
    expect(simulator.memberStates).toHaveLength(3);
    expect(simulator.memberStates[0].energy).toBe(50);
    expect(simulator.memberStates[1].energy).toBe(30);
    expect(simulator.memberStates[2].energy).toBe(10);

    const energyActivation: SkillActivation = {
      skill: commonMocks.mockMainskill,
      targeting: { chanceToTargetLowestMembers: 1, numMonsTargeted: 2 },
      activations: [
        {
          unit: 'energy',
          team: {
            crit: 0,
            regular: 30
          }
        }
      ]
    };

    simulator.maybeActivateTeamSkill(energyActivation, simulator.memberStates[0]);
    expect(simulator.memberStates[0].energy).toBe(50);
    expect(simulator.memberStates[1].energy).toBe(60);
    expect(simulator.memberStates[2].energy).toBe(40);
  });
});
