import { TeamMember, TeamSettings } from '@src/domain/combination/team';
import { TeamSimulator } from '@src/services/simulation-service/team-simulator/team-simulator';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { PokemonIngredientSet, berry, ingredient, mainskill, nature, pokemon, subskill } from 'sleepapi-common';

const mockPokemonSet: PokemonIngredientSet = {
  pokemon: {
    name: 'Mockemon',
    berry: berry.BELUE,
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
    const settings: TeamSettings = {
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
    expect(result.members[0].berries?.amount).toMatchInlineSnapshot(`26.4`);
    expect(result.members[0].ingredients[0].amount).toMatchInlineSnapshot(`6.6`);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`33`);
  });

  it('shall calculate production with uneven sleep times', () => {
    const settings: TeamSettings = {
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
    expect(result.members[0].berries?.amount).toMatchInlineSnapshot(`29.784447999999998`);
    expect(result.members[0].ingredients[0].amount).toMatchInlineSnapshot(`75.67257600000002`);
  });

  it('shall calculate team with multiple members', () => {
    const settings: TeamSettings = {
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
      expect(member.berries?.amount).toMatchInlineSnapshot(`26.4`);
      expect(member.ingredients[0].amount).toMatchInlineSnapshot(`6.6`);
      expect(member.skillProcs).toMatchInlineSnapshot(`33`);
    }
  });

  it('team members shall affect each other', () => {
    const settings: TeamSettings = {
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

    expect(result.members[0].berries?.amount).toMatchInlineSnapshot(`31.999999999999996`);
    expect(result.members[0].ingredients[0].amount).toMatchInlineSnapshot(`7.999999999999999`);
    expect(result.members[0].skillProcs).toMatchInlineSnapshot(`40`);
  });
});
