import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import {
  BALANCED_GENDER,
  berry,
  ingredient,
  mainskill,
  nature,
  PokemonWithIngredients,
  TeamMemberExt
} from 'sleepapi-common';

const mockPokemonSet: PokemonWithIngredients = {
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
    skillPercentage: 2,
    specialty: 'skill'
  },
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }
  ]
};
const member: TeamMemberExt = {
  pokemonWithIngredients: mockPokemonSet,
  settings: {
    carrySize: 10,
    level: 60,
    ribbon: 0,
    nature: nature.BASHFUL,
    skillLevel: 6,
    subskills: new Set(),
    externalId: 'some id'
  }
};
describe('calculateSkillPercentage', () => {
  it('shall calculate skill percentage for member', () => {
    expect(
      TeamSimulatorUtils.calculateSkillPercentage({ ...member, settings: { ...member.settings, nature: nature.SASSY } })
    ).toBe(0.024);
  });
});

describe('calculateIngredientPercentage', () => {
  it('shall calculate ingredient percentage for member', () => {
    expect(
      TeamSimulatorUtils.calculateIngredientPercentage({
        ...member,
        settings: { ...member.settings, nature: nature.QUIET }
      })
    ).toBe(0.24);
  });
});

describe('calculateHelpSpeedBeforeEnergy', () => {
  it('should calculate help speed without energy applied', () => {
    expect(
      TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
        member: { ...member, settings: { ...member.settings, nature: nature.LONELY, level: 1 } },
        helpingBonus: 0,
        settings: { bedtime: TimeUtils.parseTime('06:00'), wakeup: TimeUtils.parseTime('21:30'), camp: false }
      })
    ).toBe(3240);
  });
});

describe('uniqueMembersWithBerry', () => {
  it('shall calculate the unique members in team for given berry', () => {
    expect(TeamSimulatorUtils.uniqueMembersWithBerry({ berry: berry.BELUE, members: [member, member, member] })).toBe(
      1
    );
  });
});
