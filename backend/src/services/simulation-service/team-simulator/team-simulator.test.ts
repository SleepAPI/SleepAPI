import { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import {
  BALANCED_GENDER,
  PokemonIngredientSet,
  berry,
  calculatePityProcThreshold,
  ingredient,
  mainskill,
  nature,
  pokemon,
  subskill,
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
    specialty: 'skill',
  },
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
  ],
};

describe('TeamSimulator', () => {
  it('shall return expected production from mocked pokemon', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('21:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const members: TeamMember[] = [
      {
        pokemonSet: mockPokemonSet,
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: [],
      },
    ];
    const simulator = new TeamSimulator({ settings, members });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].berries?.amount).toMatchInlineSnapshot(`34.400000000000006`);
    expect(result.members[0].ingredients[0].amount).toMatchInlineSnapshot(`8.600000000000001`);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`35`);
  });

  it('shall calculate production with uneven sleep times', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('21:30'),
      wakeup: TimeUtils.parseTime('06:01'),
      camp: false,
    };

    const members: TeamMember[] = [
      {
        pokemonSet: {
          pokemon: pokemon.PINSIR,
          ingredientList: [
            { amount: 2, ingredient: ingredient.HONEY },
            { amount: 5, ingredient: ingredient.HONEY },
            { amount: 7, ingredient: ingredient.HONEY },
          ],
        },
        carrySize: 24,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: [subskill.INGREDIENT_FINDER_M],
      },
    ];
    const simulator = new TeamSimulator({ settings, members });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(1);
    expect(result.members[0].berries?.amount).toMatchInlineSnapshot(`41.562818229753496`);
    expect(result.members[0].ingredients[0].amount).toMatchInlineSnapshot(`92.89420577024651`);
  });

  it('shall calculate team with multiple members', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('21:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const mockMember: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };

    const members: TeamMember[] = [mockMember, mockMember, mockMember, mockMember, mockMember];
    const simulator = new TeamSimulator({ settings, members });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(5);

    for (const member of result.members) {
      expect(member.berries?.amount).toEqual(34.400000000000006);
      expect(member.ingredients[0].amount).toEqual(8.600000000000001);
      expect(member.skillProcs).toEqual(35);
    }
  });

  it('team members shall affect each other', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('21:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const mockMember: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };
    const mockMemberSupport: TeamMember = {
      pokemonSet: {
        ...mockPokemonSet,
        pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100, skill: mainskill.ENERGY_FOR_EVERYONE },
      },
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };

    const members: TeamMember[] = [mockMember, mockMemberSupport];
    const simulator = new TeamSimulator({ settings, members });

    simulator.simulate();

    const result = simulator.results();

    expect(result.members).toHaveLength(2);

    expect(result.members[0].berries?.amount).toMatchInlineSnapshot(`50`);
    expect(result.members[0].ingredients[0].amount).toMatchInlineSnapshot(`10`);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`42`);
  });

  it('shall give pity procs to certain fast pokemon', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('21:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const mockMember = {
      ...mockPokemonSet,
      pokemon: { ...mockPokemonSet.pokemon, frequency: 3000, skillPercentage: 0 },
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
      },
    ];
    const simulator = new TeamSimulator({ settings, members });

    simulator.simulate();

    const result = simulator.results();
    expect(result.members).toHaveLength(1);
    const member = result.members[0];

    const helpsBeforeSS = member.advanced.dayHelps + member.advanced.nightHelpsBeforeSS;
    const pityProcThreshold = calculatePityProcThreshold(mockMember.pokemon);
    const expectedPityProcs = Math.floor(helpsBeforeSS / pityProcThreshold);

    expect(helpsBeforeSS).toMatchInlineSnapshot(`50`);
    expect(pityProcThreshold).toMatchInlineSnapshot(`48`);
    expect(expectedPityProcs).toMatchInlineSnapshot(`1`);

    expect(member.skillProcs).toMatchInlineSnapshot(`1`);
  });
});
