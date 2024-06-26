import { TeamMember, TeamSettings } from '@src/domain/combination/team';
import { calculateFrequencyWithEnergy } from '@src/services/calculator/help/help-calculator';
import { MemberState } from '@src/services/simulation-service/team-simulator/member-state';
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
    maxCarrySize: 10,
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

const settings: TeamSettings = {
  bedtime: TimeUtils.parseTime('21:30'),
  wakeup: TimeUtils.parseTime('06:00'),
  camp: false,
};

describe('MemberState init', () => {
  const memberState = new MemberState({ member, settings, team: [member] });

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
    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(memberState.energy).toBe(100);
  });

  it('shall recover less than full sleep if energy- nature', () => {
    const member: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [],
    };

    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(memberState.energy).toBe(88);
  });

  it('shall recover less than full sleep if sleeping short', () => {
    const member: TeamMember = {
      pokemonSet: mockPokemonSet,
      carrySize: 10,
      level: 60,
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [],
    };

    const settings: TeamSettings = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(Math.round(memberState.energy)).toBe(67);
  });

  it('shall recover max up to 100 if member has residual energy from day before', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
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
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [subskill.ENERGY_RECOVERY_BONUS],
    };

    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.startDay();
    expect(memberState.energy).toBe(100);
  });
});

describe('recoverEnergy', () => {
  it('shall recover energy from e4e', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
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
      nature: nature.MILD,
      skillLevel: 6,
      subskills: [],
    };

    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(50);
    expect(memberState.energy).toBe(44);
  });

  it('shall recover max 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(200);
    expect(memberState.energy).toBe(150);
    memberState.recoverEnergy(10);
    expect(memberState.energy).toBe(150);
  });
});

describe('addHelps', () => {
  it('shall add 1 average produce help', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.addHelps(1);
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
      {
        "berries": "0.8 BELUE",
        "ingredients": "0.2 Tail",
        "skillProcs": 0,
      }
    `);
  });

  it('shall not add produce if adding 0 helps', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.addHelps(0);
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
      {
        "berries": "0 BELUE",
        "ingredients": "0 Tail",
        "skillProcs": 0,
      }
    `);
  });
});

describe('recoverMeal', () => {
  it('shall recover energy from cooking', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(5);
  });

  it('shall recover no energy from cooking at 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(150);
    expect(memberState.energy).toBe(150);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(150);
  });
});

describe('attemptDayHelp', () => {
  it('shall perform a help if time surpasses scheduled help time', () => {
    const settings: TeamSettings = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.attemptDayHelp(TimeUtils.parseTime('06:01'));
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
      {
        "berries": "0.8 BELUE",
        "ingredients": "0.2 Tail",
        "skillProcs": 0,
      }
    `);
  });

  it('shall not perform a help if time has not passed scheduled help time', () => {
    const settings: TeamSettings = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.attemptDayHelp(TimeUtils.parseTime('05:59'));
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
      {
        "berries": "no berries",
        "ingredients": "",
        "skillProcs": 0,
      }
    `);
  });

  it('shall schedule the next help', () => {
    const settings: TeamSettings = {
      bedtime: TimeUtils.parseTime('23:30'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: false,
    };

    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.attemptDayHelp(TimeUtils.parseTime('06:00'));
    memberState.collectInventory();

    expect(memberState.averageResults(1).berries).toMatchInlineSnapshot(`"0.8 BELUE"`);

    const frequencyBeforeEnergy = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      helpingBonus: 0,
    });
    const frequency = calculateFrequencyWithEnergy(frequencyBeforeEnergy, memberState.energy);
    const nextHelp = TimeUtils.addTime(TimeUtils.parseTime('06:00'), TimeUtils.secondsToTime(frequency));

    const justBeforeNextHelp = TimeUtils.addTime(nextHelp, { hour: 0, minute: -1, second: 0 });

    memberState.attemptDayHelp(justBeforeNextHelp);
    memberState.collectInventory();
    expect(memberState.averageResults(1).berries).toMatchInlineSnapshot(`"0.8 BELUE"`);

    memberState.attemptDayHelp(nextHelp);
    memberState.collectInventory();
    expect(memberState.averageResults(1).berries).toMatchInlineSnapshot(`"1.6 BELUE"`);
  });

  it('shall empty inventory if full', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    // fill inv
    memberState.addHelps(100);

    memberState.attemptDayHelp(TimeUtils.parseTime('06:00'));
    expect(memberState.averageResults(1).berries).toMatchInlineSnapshot(`"80.8 BELUE"`);
  });

  it('shall attempt and proc skill', () => {
    const member: TeamMember = {
      pokemonSet: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
      carrySize: 10,
      level: 60,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };
    const memberState = new MemberState({ member, settings, team: [member] });
    // fill inv
    memberState.attemptDayHelp(TimeUtils.parseTime('06:00'));

    expect(memberState.averageResults(1).skillProcs).toBe(1);
  });

  it('shall still count metronome proc as 1 proc', () => {
    const member: TeamMember = {
      pokemonSet: {
        ...mockPokemonSet,
        pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100, skill: mainskill.METRONOME },
      },
      carrySize: 10,
      level: 60,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };
    const memberState = new MemberState({ member, settings, team: [member] });
    // fill inv
    memberState.attemptDayHelp(TimeUtils.parseTime('06:00'));

    expect(memberState.averageResults(1).skillProcs).toBe(1);
  });
});

describe('attemptNightHelp', () => {
  it('shall not perform night help during the day', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.attemptNightHelp(TimeUtils.parseTime('06:05'));
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
          {
            "berries": "no berries",
            "ingredients": "",
            "skillProcs": 0,
          }
      `);
  });

  it('shall add 1 night help', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.attemptNightHelp(TimeUtils.parseTime('06:00'));
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
      {
        "berries": "0.8 BELUE",
        "ingredients": "0.2 Tail",
        "skillProcs": 0,
      }
    `);
  });

  it('shall add any excess helps to sneaky snacking, and shall not roll skill proc on those', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.addHelps(100);
    memberState.attemptNightHelp(TimeUtils.parseTime('06:00'));
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
      {
        "berries": "81 BELUE",
        "ingredients": "20 Tail",
        "skillProcs": 0,
      }
    `);
  });

  it('shall roll skill proc on helps before inventory full at night, upon collecting in the morning', () => {
    const member: TeamMember = {
      pokemonSet: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
      carrySize: 10,
      level: 60,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: [],
    };
    const memberState = new MemberState({ member, settings, team: [member] });
    memberState.attemptNightHelp(TimeUtils.parseTime('06:00'));
    memberState.collectInventory();

    expect(memberState.averageResults(1)).toMatchInlineSnapshot(`
      {
        "berries": "0.8 BELUE",
        "ingredients": "0.2 Tail",
        "skillProcs": 1,
      }
    `);
  });
});

describe('degradeEnergy', () => {
  it('shall degrade energy by 1', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(100);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(99);
  });

  it('shall degrade by less than 1 if less than 1 energy left total', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(0.1);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(0);
  });

  it('shall not degrade if energy at 0', () => {
    const memberState = new MemberState({ member, settings, team: [member] });
    expect(memberState.energy).toBe(0);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(0);
  });
});
