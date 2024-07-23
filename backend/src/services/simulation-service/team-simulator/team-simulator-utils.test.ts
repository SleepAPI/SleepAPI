import { TeamMember } from '@src/domain/combination/team';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { PokemonIngredientSet, berry, ingredient, mainskill, nature, subskill } from 'sleepapi-common';

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
    skillPercentage: 2,
    specialty: 'skill',
  },
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
  ],
};
const member: TeamMember = {
  pokemonSet: mockPokemonSet,
  carrySize: 10,
  level: 60,
  nature: nature.BASHFUL,
  skillLevel: 6,
  subskills: [],
};
describe('calculateSkillPercentage', () => {
  it('shall calculate skill percentage for member', () => {
    expect(TeamSimulatorUtils.calculateSkillPercentage({ ...member, nature: nature.SASSY })).toBe(0.024);
  });
});

describe('calculateIngredientPercentage', () => {
  it('shall calculate ingredient percentage for member', () => {
    expect(TeamSimulatorUtils.calculateIngredientPercentage({ ...member, nature: nature.QUIET })).toBe(0.24);
  });
});

describe('calculateHelpSpeedBeforeEnergy', () => {
  expect(
    TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member: { ...member, nature: nature.LONELY, level: 1 },
      helpingBonus: 0,
      settings: { bedtime: TimeUtils.parseTime('06:00'), wakeup: TimeUtils.parseTime('21:30'), camp: false },
    })
  ).toBe(3240);
});

describe('calculateNrOfBerriesPerDrop', () => {
  it('shall calculate the correct number of berries per drop', () => {
    expect(TeamSimulatorUtils.calculateNrOfBerriesPerDrop({ ...member, subskills: [subskill.BERRY_FINDING_S] })).toBe(
      2
    );
  });
});

describe('uniqueMembersWithBerry', () => {
  it('shall calculate the unique members in team for given berry', () => {
    expect(TeamSimulatorUtils.uniqueMembersWithBerry({ berry: berry.BELUE, members: [member, member, member] })).toBe(
      1
    );
  });
});
