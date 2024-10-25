import { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
import { calculateFrequencyWithEnergy } from '@src/services/calculator/help/help-calculator';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state';
import { MemberState } from '@src/services/simulation-service/team-simulator/member-state';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { BALANCED_GENDER, PokemonIngredientSet, berry, ingredient, mainskill, nature, subskill } from 'sleepapi-common';

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
  ribbon: 0,
  nature: nature.BASHFUL,
  skillLevel: 6,
  subskills: [],
};

const settings: TeamSettingsExt = {
  bedtime: TimeUtils.parseTime('21:30'),
  wakeup: TimeUtils.parseTime('06:00'),
  camp: false,
};

const cookingState: CookingState = new CookingState(settings.camp);

describe('MemberState init', () => {
  const memberState = new MemberState({ member, settings, team: [member], cookingState });

  it('shall return expected skill level', () => {
    expect(memberState.skillLevel).toBe(6);
  });

  it('shall return expected team size', () => {
    expect(memberState.teamSize).toBe(1);
  });

  it('shall return expected berry', () => {
    expect(memberState.berry).toBe(berry.BELUE);
  });

  it('shall return expected inventory limit', () => {
    expect(memberState.inventoryLimit).toBe(10);
  });

  it('shall return expected energy', () => {
    expect(memberState.energy).toBe(0);
  });
});

describe('startDay', () => {
  it('shall recover full sleep', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(memberState.energy).toBe(100);
  });

  it('shall recover less than full sleep if energy- nature', () => {
    const member: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [],
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(memberState.energy).toBe(88);
  });

  it('shall recover less than full sleep if sleeping short', () => {
    const member: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [],
    };

    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(Math.round(memberState.energy)).toBe(67);
  });

  it('shall recover max up to 100 if member has residual energy from day before', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(50);
    expect(memberState.energy).toBe(50);
    memberState.startDay();
    expect(Math.round(memberState.energy)).toBe(100);
  });

  it('shall recover to 100 despite energy- nature if team has erb', () => {
    const member: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [subskill.ENERGY_RECOVERY_BONUS],
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(memberState.energy).toBe(100);
  });
});

describe('recoverEnergy', () => {
  it('shall recover energy from e4e', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(18);
    expect(memberState.energy).toBe(18);
    memberState.recoverEnergy(18);
    expect(memberState.energy).toBe(36);
  });

  it('shall recover less energy with energy- nature', () => {
    const member: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [],
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(50);
    expect(memberState.energy).toBe(44);
  });

  it('shall recover max 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(200);
    expect(memberState.energy).toBe(150);
    memberState.recoverEnergy(10);
    expect(memberState.energy).toBe(150);
  });
});

describe('addHelps', () => {
  it('shall add 1 average produce help', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addHelps(1);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "dayHelps": 0,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "spilledIngredients": [],
          "totalHelps": 0,
        },
        "berries": {
          "amount": 0.8,
          "berry": {
            "name": "BELUE",
            "type": "steel",
            "value": 33,
          },
        },
        "externalId": undefined,
        "ingredients": [
          {
            "amount": 0.2,
            "ingredient": {
              "longName": "Slowpoke Tail",
              "name": "Tail",
              "taxedValue": 342,
              "value": 342,
            },
          },
        ],
        "skillAmount": 0,
        "skillProcs": 0,
      }
    `);
  });

  it('shall not add produce if adding 0 helps', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addHelps(0);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "dayHelps": 0,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "spilledIngredients": [],
          "totalHelps": 0,
        },
        "berries": {
          "amount": 0,
          "berry": {
            "name": "BELUE",
            "type": "steel",
            "value": 33,
          },
        },
        "externalId": undefined,
        "ingredients": [
          {
            "amount": 0,
            "ingredient": {
              "longName": "Slowpoke Tail",
              "name": "Tail",
              "taxedValue": 342,
              "value": 342,
            },
          },
        ],
        "skillAmount": 0,
        "skillProcs": 0,
      }
    `);
  });
});

describe('recoverMeal', () => {
  it('shall recover energy from cooking', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(5);
  });

  it('shall recover no energy from cooking at 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(150);
    expect(memberState.energy).toBe(150);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(150);
  });
});

describe('attemptDayHelp', () => {
  it('shall perform a help if time surpasses scheduled help time', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const member: TeamMember = {
      pokemonSet: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 0 } },
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    memberState.attemptDayHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "dayHelps": 1,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "spilledIngredients": [],
          "totalHelps": 1,
        },
        "berries": {
          "amount": 0.8,
          "berry": {
            "name": "BELUE",
            "type": "steel",
            "value": 33,
          },
        },
        "externalId": undefined,
        "ingredients": [
          {
            "amount": 0.2,
            "ingredient": {
              "longName": "Slowpoke Tail",
              "name": "Tail",
              "taxedValue": 342,
              "value": 342,
            },
          },
        ],
        "skillAmount": 0,
        "skillProcs": 0,
      }
    `);
  });

  it('shall not perform a help if time has not passed scheduled help time', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    memberState.attemptDayHelp(-1);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "dayHelps": 0,
          "nightHelps": 0,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 0,
          "spilledIngredients": [],
          "totalHelps": 0,
        },
        "berries": {
          "amount": 0,
          "berry": {
            "name": "BELUE",
            "type": "steel",
            "value": 33,
          },
        },
        "externalId": undefined,
        "ingredients": [
          {
            "amount": 0,
            "ingredient": {
              "longName": "Slowpoke Tail",
              "name": "Tail",
              "taxedValue": 342,
              "value": 342,
            },
          },
        ],
        "skillAmount": 0,
        "skillProcs": 0,
      }
    `);
  });

  it('shall schedule the next help', () => {
    const settings: TeamSettingsExt = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).advanced.totalHelps).toEqual(1);

    const frequencyBeforeEnergy = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      helpingBonus: 0,
    });
    const frequency = calculateFrequencyWithEnergy(frequencyBeforeEnergy, memberState.energy);
    const nextHelp = frequency / 60;

    const justBeforeNextHelp = nextHelp - 1;

    memberState.attemptDayHelp(justBeforeNextHelp);
    expect(memberState.results(1).advanced.totalHelps).toEqual(1);

    memberState.attemptDayHelp(nextHelp);
    expect(memberState.results(1).advanced.totalHelps).toEqual(2);
  });

  it('shall attempt and proc skill', () => {
    const member: TeamMember = {
      pokemonSet: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).skillProcs).toBe(1);
  });

  it('shall still count metronome proc as 1 proc', () => {
    const member: TeamMember = {
      pokemonSet: {
        ...mockPokemonSet,
        pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100, skill: mainskill.METRONOME },
      },
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    // fill inv
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).skillProcs).toBe(1);
  });
});

describe('attemptNightHelp', () => {
  it('shall not perform night help if the time has not passed scheduled time', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    memberState.attemptNightHelp(-1);

    expect(memberState.results(1).advanced.totalHelps).toEqual(0);
    expect(memberState.results(1).advanced.nightHelps).toEqual(0);
  });

  it('shall add 1 night help', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    memberState.attemptNightHelp(0);

    expect(memberState.results(1).advanced.nightHelps).toEqual(1);
  });

  it('shall add any excess helps to sneaky snacking, and shall not roll skill proc on those', () => {
    const noCarryMember: TeamMember = { ...member, carrySize: 0 };
    const memberState = new MemberState({ member: noCarryMember, settings, team: [noCarryMember], cookingState });
    memberState.startDay();
    memberState.attemptNightHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1).skillProcs).toEqual(0);
    expect(memberState.results(1).ingredients.reduce((sum, cur) => sum + cur.amount, 0)).toEqual(0);
    expect(memberState.results(1).advanced.nightHelps).toEqual(1);
    expect(memberState.results(1).advanced.totalHelps).toEqual(1);
  });

  it('shall roll skill proc on helps before inventory full at night, upon collecting in the morning', () => {
    const member: TeamMember = {
      pokemonSet: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.startDay();
    memberState.attemptNightHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchInlineSnapshot(`
      {
        "advanced": {
          "dayHelps": 0,
          "nightHelps": 1,
          "nightHelpsAfterSS": 0,
          "nightHelpsBeforeSS": 1,
          "spilledIngredients": [],
          "totalHelps": 1,
        },
        "berries": {
          "amount": 0.8,
          "berry": {
            "name": "BELUE",
            "type": "steel",
            "value": 33,
          },
        },
        "externalId": undefined,
        "ingredients": [
          {
            "amount": 0.2,
            "ingredient": {
              "longName": "Slowpoke Tail",
              "name": "Tail",
              "taxedValue": 342,
              "value": 342,
            },
          },
        ],
        "skillAmount": 2066,
        "skillProcs": 1,
      }
    `);
  });
});

describe('degradeEnergy', () => {
  it('shall degrade energy by 1', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(100);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(99);
  });

  it('shall degrade by less than 1 if less than 1 energy left total', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(0.1);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(0);
  });

  it('shall not degrade if energy at 0', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(0);
  });
});
