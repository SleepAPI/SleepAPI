import type { TeamMember, TeamSettingsExt } from '@src/domain/combination/team.js';
import type { TeamSkillEnergy } from '@src/services/simulation-service/team-simulator/member-state.js';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { afterEach, describe, expect, it } from 'bun:test';
import { boozle, unboozle } from 'bunboozle';
import type { PokemonIngredientSet } from 'sleepapi-common';
import {
  BALANCED_GENDER,
  berry,
  calculatePityProcThreshold,
  ingredient,
  mainskill,
  nature,
  pokemon,
  RandomUtils,
  subskill
} from 'sleepapi-common';

const mockPokemonSet: PokemonIngredientSet = {
  pokemon: {
    name: 'Mockemon',
    berry: berry.BELUE,
    genders: BALANCED_GENDER,
    carrySize: 10,
    frequency: 3600,
    ingredient0: { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    ingredient30: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredientPercentage: 20,
    previousEvolutions: 0,
    remainingEvolutions: 0,
    skill: mainskill.CHARGE_STRENGTH_S,
    skillPercentage: 100,
    specialty: 'skill'
  },
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }
  ]
};
const mockSettings: TeamSettingsExt = {
  bedtime: TimeUtils.parseTime('21:30'),
  wakeup: TimeUtils.parseTime('06:00'),
  camp: false
};
const mockMembers: TeamMember[] = [
  {
    pokemonSet: mockPokemonSet,
    carrySize: 10,
    level: 60,
    ribbon: 0,
    nature: nature.BASHFUL,
    skillLevel: 6,
    subskills: [],
    externalId: 'some id'
  }
];

describe('TeamSimulator', () => {
  afterEach(() => {
    unboozle();
  });

  it('shall return expected production from mocked pokemon', () => {
    const simulator = new TeamSimulator({ settings: mockSettings, members: mockMembers, includeCooking: true });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal.berries[0].amount).toMatchInlineSnapshot(`35.4`);
    expect(result.members[0].produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`8.6`);
    expect(result.members[0].advanced.morningProcs).toBe(2);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`35`);
  });

  it('shall return expected variant production from mocked pokemon', () => {
    const simulator = new TeamSimulator({ settings: mockSettings, members: mockMembers, includeCooking: true });

    simulator.simulate();

    const result = simulator.ivResults(mockMembers[0].externalId);

    expect(result.produceTotal.berries[0].amount).toMatchInlineSnapshot(`35.4`);
    expect(result.produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`8.6`);
    expect(result.skillProcs).toMatchInlineSnapshot(`35`);
  });

  it('shall calculate production with uneven sleep times', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('21:30'),
      wakeup: TimeUtils.parseTime('06:01'),
      camp: false
    };

    const members: TeamMember[] = [
      {
        pokemonSet: {
          pokemon: pokemon.PINSIR,
          ingredientList: [
            { amount: 2, ingredient: ingredient.HONEY },
            { amount: 5, ingredient: ingredient.HONEY },
            { amount: 7, ingredient: ingredient.HONEY }
          ]
        },
        carrySize: 24,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: [subskill.INGREDIENT_FINDER_M],
        externalId: 'some id'
      }
    ];
    const simulator = new TeamSimulator({ settings, members, includeCooking: true });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal.berries[0].amount).toMatchInlineSnapshot(`40.56281822975349`);
    expect(result.members[0].produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`92.89420577024654`);
  });

  it('shall calculate team with multiple members', () => {
    const mockMember: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
      externalId: 'some id'
    };

    const members: TeamMember[] = [mockMember, mockMember, mockMember, mockMember, mockMember];
    const simulator = new TeamSimulator({ settings: mockSettings, members, includeCooking: true });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(5);

    for (const member of result.members) {
      expect(member.produceTotal.berries[0].amount).toEqual(35.4);
      expect(member.produceTotal.ingredients[0].amount).toEqual(8.6);
      expect(member.skillProcs).toEqual(35);
    }
  });

  it('team members shall affect each other', () => {
    const mockMember: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
      externalId: 'some id'
    };
    const mockMemberSupport: TeamMember = {
      pokemonSet: {
        ...mockPokemonSet,
        pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100, skill: mainskill.ENERGY_FOR_EVERYONE }
      },
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
      externalId: 'some id'
    };

    const members: TeamMember[] = [mockMember, mockMemberSupport];
    const simulator = new TeamSimulator({ settings: mockSettings, members, includeCooking: true });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(2);

    expect(result.members[0].produceTotal.berries[0].amount).toMatchInlineSnapshot(`51`);
    expect(result.members[0].produceTotal.ingredients[0].amount).toMatchInlineSnapshot(`10`);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`42`);
  });

  it('shall count wasted energy', () => {
    const mockMemberSupport: TeamMember = {
      pokemonSet: {
        ...mockPokemonSet,
        pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100, skill: mainskill.ENERGY_FOR_EVERYONE }
      },
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.ADAMANT,
      skillLevel: mainskill.ENERGY_FOR_EVERYONE.maxLevel,
      subskills: [subskill.HELPING_SPEED_M],
      externalId: 'some id'
    };

    const members: TeamMember[] = [
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport,
      mockMemberSupport
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, includeCooking: true });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(5);
    const skillAmount = result.members[0].skillAmount;
    const wasteAmount = result.members[0].advanced.wastedEnergy;
    expect(skillAmount).toMatchInlineSnapshot(`726.5`);
    expect(wasteAmount).toMatchInlineSnapshot(`4070`);
    expect(5 * result.members[0].skillProcs * mainskill.ENERGY_FOR_EVERYONE.maxAmount).toEqual(
      skillAmount + wasteAmount
    );
  });

  it('shall give pity procs when threshold met', () => {
    const mockMember = {
      ...mockPokemonSet,
      pokemon: { ...mockPokemonSet.pokemon, frequency: 3000, skillPercentage: 0 }
    };
    const members: TeamMember[] = [
      {
        pokemonSet: mockMember,
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: [],
        externalId: 'some id'
      }
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, includeCooking: true });

    simulator.simulate();

    const result = simulator.results();
    expect(result.members).toHaveLength(1);
    const member = result.members[0];

    const helpsBeforeSS = member.advanced.dayHelps + member.advanced.nightHelpsBeforeSS;
    const pityProcThreshold = calculatePityProcThreshold(mockMember.pokemon);
    const expectedPityProcs = Math.floor(helpsBeforeSS / pityProcThreshold);

    expect(helpsBeforeSS).toMatchInlineSnapshot(`49`);
    expect(pityProcThreshold).toMatchInlineSnapshot(`48`);
    expect(expectedPityProcs).toMatchInlineSnapshot(`1`);

    expect(member.skillProcs).toMatchInlineSnapshot(`1`);
  });

  it('shall only allow 1 disguise crit until sleep reset', () => {
    boozle(RandomUtils, 'roll', () => true);

    const members: TeamMember[] = [
      {
        pokemonSet: {
          ...mockPokemonSet,
          pokemon: {
            ...pokemon.MOCK_POKEMON,
            skill: mainskill.DISGUISE_BERRY_BURST,
            // one help every ~12 hours, final x2 multiplication is to account for energy frequency
            frequency: 60 * 60 * 12 * 2,
            // 100% chance to activate skill per help
            skillPercentage: 100
          }
        },
        carrySize: 10,
        level: 1,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: [],
        externalId: 'some id'
      }
    ];
    const simulator = new TeamSimulator({ settings: mockSettings, members, includeCooking: true });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].skillProcs).toBe(2);
    expect(result.members[0].produceFromSkill.berries).toHaveLength(1);
    const amountPerProc = mainskill.DISGUISE_BERRY_BURST.amount(6);
    expect(result.members[0].produceFromSkill.berries[0].amount).toBe(amountPerProc * 3 + amountPerProc);
    expect(result.members[0].produceFromSkill.berries[0].amount).toBe(84);
  });
});

describe('recoverMemberEnergy', () => {
  it("shall recover every member's energy", () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers),
      includeCooking: true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    const energy: TeamSkillEnergy = {
      amount: 50,
      chanceTargetLowest: 0,
      random: false
    };

    simulator.recoverMemberEnergy(energy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    simulator.memberStates.forEach((member: any) => {
      expect(member.energy).toBe(50);
    });
  });

  it('shall recover member energy', () => {
    const simulator = new TeamSimulator({
      settings: mockSettings,
      members: mockMembers.concat(mockMembers),
      includeCooking: true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
    simulator.memberStates[0].recoverEnergy(100);

    const energy: TeamSkillEnergy = {
      amount: 50,
      chanceTargetLowest: 1, // guaranteed to hit lowest member
      random: true
    };

    simulator.recoverMemberEnergy(energy);
    expect(simulator.memberStates).toHaveLength(2);
    expect(simulator.memberStates[0].energy).toBe(100);
    expect(simulator.memberStates[1].energy).toBe(50);
  });
});
