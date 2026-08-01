import { calculateFrequencyWithEnergy } from '@src/services/calculator/help/help-calculator.js';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientSet, PokemonWithIngredients, TeamMember, TeamSettings } from 'sleepapi-common';
import {
  berry,
  ChargeStrengthM,
  ChargeStrengthS,
  commonMocks,
  DEFAULT_ISLAND,
  emptyIngredientInventoryFloat,
  ingredient,
  MAX_POT_SIZE,
  Metronome,
  nature,
  parseTime,
  subskill
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

const mockPokemonSet: PokemonWithIngredients = {
  pokemon: commonMocks.mockPokemon({
    carrySize: 10,
    frequency: 3600,
    ingredient0: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient30: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
    ingredientPercentage: 20,
    skill: ChargeStrengthS,
    skillPercentage: 2,
    specialty: 'skill'
  }),
  ingredientList: [
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL },
    { amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }
  ]
};

const guaranteedSkillProcMember: TeamMember = {
  pokemonWithIngredients: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
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

const member: TeamMember = {
  pokemonWithIngredients: mockPokemonSet,
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

const sneakySnackingMember: TeamMember = {
  pokemonWithIngredients: guaranteedSkillProcMember.pokemonWithIngredients,
  settings: {
    ...guaranteedSkillProcMember.settings,
    sneakySnacking: true
  }
};

const settings: TeamSettings = {
  bedtime: parseTime('21:30'),
  wakeup: parseTime('06:00'),
  camp: false,
  includeCooking: true,
  stockpiledIngredients: emptyIngredientInventoryFloat(),
  potSize: MAX_POT_SIZE,
  island: { ...DEFAULT_ISLAND }
};

const cookingState: CookingState = new CookingState(settings, defaultUserRecipes(), createPreGeneratedRandom());

describe('results', () => {
  it('should return correct results after multiple iterations', () => {
    const memberState = new MemberState({ member: guaranteedSkillProcMember, settings, team: [member], cookingState });
    for (let i = 0; i < 100; i++) {
      memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
      memberState.collectInventory();
    }
    const results = memberState.results(10);

    expect(results.produceTotal.berries.length).toBeGreaterThan(0);
    expect(results.produceTotal.ingredients.length).toBeGreaterThan(0);
    expect(results.skillProcs).toBe(10);
  });

  it('should return zero results if no helps or skills are added', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    const results = memberState.results(10);

    expect(results.produceTotal.berries.length).toBe(0);
    expect(results.produceTotal.ingredients.length).toBe(0);
    expect(results.skillAmount).toBe(0);
    expect(results.skillProcs).toBe(0);
  });

  it('should return only berries for a sneaky snacker', () => {
    const memberState = new MemberState({
      member: sneakySnackingMember,
      settings,
      team: [sneakySnackingMember],
      cookingState
    });
    memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
    memberState.collectInventory();
    const results = memberState.results(1);

    expect(results.produceTotal.berries.length).toBeGreaterThan(0);
    expect(results.produceTotal.ingredients.length).toBe(0);
    expect(results.skillProcs).toBe(0);
  });
});

describe('simpleResults', () => {
  it('should return correct simple results', () => {
    const memberState = new MemberState({ member: guaranteedSkillProcMember, settings, team: [member], cookingState });
    memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
    memberState.collectInventory();
    const simpleResults = memberState.simpleResults(10);

    expect(simpleResults.skillProcs).toBe(0.1);
    expect(simpleResults.totalHelps).toBe(0.1);
  });

  it('should return zero simple results if no helps or skills are added', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });

    const simpleResults = memberState.simpleResults(10);

    expect(simpleResults.skillProcs).toBe(0);
    expect(simpleResults.totalHelps).toBe(0);
  });

  it('should return zero skill procs for a sneaky snacker', () => {
    const memberState = new MemberState({
      member: sneakySnackingMember,
      settings,
      team: [sneakySnackingMember],
      cookingState
    });
    memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
    memberState.collectInventory();
    const simpleResults = memberState.simpleResults(10);

    expect(simpleResults.totalHelps).toBe(0.1);
    expect(simpleResults.skillProcs).toBe(0);
  });
});

describe('ivResults', () => {
  it('should return correct iv results', () => {
    const ingredientList: IngredientSet[] = [{ amount: 10, ingredient: ingredient.FANCY_APPLE }];

    // this member has 2 berries per drop and 10 apples per drop, 50% ing% gives average of 1 berry and 5 apples
    const memberState = new MemberState({
      member: {
        ...guaranteedSkillProcMember,
        pokemonWithIngredients: {
          pokemon: commonMocks.mockPokemon({
            specialty: 'berry',
            ingredientPercentage: 50,
            skillPercentage: 100,
            skill: ChargeStrengthM
          }),
          ingredientList
        },
        settings: { ...guaranteedSkillProcMember.settings, level: 1 }
      },
      settings,
      team: [member],
      cookingState
    });
    for (let i = 0; i < 100; i++) {
      memberState.attemptDayHelp(10000000); // guarantee a help and skill roll
      memberState.collectInventory();
    }
    const ivResults = memberState.ivResults(10);

    // we have had 1 help so total should be 1 berry and 5 apples
    // we then divide by 10 since we ran result for 10 days
    expect(ivResults.produceTotal.berries).toHaveLength(1);
    expect(ivResults.produceTotal.berries[0].amount).toBeCloseTo(10.6); // approximately 10

    expect(ivResults.produceTotal.ingredients).toHaveLength(1);
    expect(ivResults.produceTotal.ingredients[0].amount).toBe(47); // approximately 50

    expect(ivResults.skillProcs).toBeGreaterThan(0);
  });

  it('should return zero iv results if no helps or skills are added', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    const ivResults = memberState.ivResults(10);

    expect(ivResults.produceTotal.berries.length).toBe(0);
    expect(ivResults.produceTotal.ingredients.length).toBe(0);
    expect(ivResults.skillProcs).toBe(0);
  });
});

describe('MemberState init', () => {
  const memberState = new MemberState({ member, settings, team: [member], cookingState });

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
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(100);
  });

  it('shall recover less than full sleep if energy- nature', () => {
    const member: TeamMember = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id',
        sneakySnacking: false
      }
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(88);
  });

  it('shall recover less than full sleep if sleeping short', () => {
    const member: TeamMember = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id',
        sneakySnacking: false
      }
    };

    const settings: TeamSettings = mocks.teamSettings({ bedtime: parseTime('23:30') });

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(Math.round(memberState.energy)).toBe(67);
  });

  it('shall recover max up to 100 if member has residual energy from day before', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(50, memberState);
    expect(memberState.energy).toBe(50);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(Math.round(memberState.energy)).toBe(100);
  });

  it('shall recover to 100 despite energy- nature if teammate has erb', () => {
    const member: TeamMember = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id',
        sneakySnacking: false
      }
    };
    const teammate: TeamMember = {
      ...member,
      settings: {
        ...member.settings,
        subskills: new Set([subskill.ENERGY_RECOVERY_BONUS.name])
      }
    };

    const memberState = new MemberState({ member, settings, team: [member, teammate], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(100);
  });

  it('shall recover to 105 if member has erb', () => {
    const member: TeamMember = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.BASHFUL,
        skillLevel: 6,
        subskills: new Set([subskill.ENERGY_RECOVERY_BONUS.name]),
        externalId: 'some id',
        sneakySnacking: false
      }
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.wakeUp();
    memberState.collectInventory();
    expect(memberState.energy).toBe(105);
  });
});

describe('recoverEnergy', () => {
  it('shall recover energy from e4e', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(18, memberState);
    expect(memberState.energy).toBe(18);
    memberState.recoverEnergy(18, memberState);
    expect(memberState.energy).toBe(36);
  });

  it('shall recover less energy with energy- nature', () => {
    const member: TeamMember = {
      pokemonWithIngredients: mockPokemonSet,
      settings: {
        carrySize: 10,
        level: 60,
        ribbon: 0,
        nature: nature.MILD,
        skillLevel: 6,
        subskills: new Set(),
        externalId: 'some id',
        sneakySnacking: false
      }
    };

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(50, memberState);
    expect(memberState.energy).toBe(44);
  });

  it('shall recover max 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(200, memberState);
    expect(memberState.energy).toBe(150);
    memberState.recoverEnergy(10, memberState);
    expect(memberState.energy).toBe(150);
  });
});

describe('addHelpsFromSkill', () => {
  it('shall add 1 average produce help', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addHelpsFromSkill({ regular: 1, crit: 1 }, memberState);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchSnapshot();
  });

  it('shall not add produce if adding 0 helps', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addHelpsFromSkill({ regular: 0, crit: 0 }, memberState);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchSnapshot();
  });

  it('shall add ingredients for a sneaky snacker', () => {
    const memberState = new MemberState({
      member: sneakySnackingMember,
      settings,
      team: [sneakySnackingMember],
      cookingState
    });
    memberState.addHelpsFromSkill({ regular: 10, crit: 0 }, memberState);
    memberState.collectInventory();

    expect(memberState.results(1).produceTotal.ingredients.length).toBeGreaterThan(0);
    expect(memberState.results(1).produceTotal.ingredients[0].amount).toBeGreaterThan(0);
  });
});

describe('recoverMeal', () => {
  it('shall recover energy from cooking', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(9);
  });

  it('shall recover no energy from cooking at 150 energy', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(150, memberState);
    expect(memberState.energy).toBe(150);
    memberState.recoverMeal();
    expect(memberState.energy).toBe(150);
  });
});

describe('attemptDayHelp', () => {
  it('shall perform a help if time surpasses scheduled help time', () => {
    const settings: TeamSettings = mocks.teamSettings({ bedtime: parseTime('23:30') });

    const member: TeamMember = {
      pokemonWithIngredients: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 0 } },
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

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchSnapshot();
  });

  it('shall not perform a help if time has not passed scheduled help time', () => {
    const settings: TeamSettings = mocks.teamSettings({ bedtime: parseTime('23:30') });

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(-1);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchSnapshot();
  });

  it('shall schedule the next help', () => {
    const settings: TeamSettings = mocks.teamSettings();

    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(0);
    memberState.scheduleHelp(0);

    expect(memberState.results(1).advanced.totalHelps).toEqual(1);

    const frequencyBeforeEnergy = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      teamHelpingBonus: 0
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
    const memberState = new MemberState({
      member: guaranteedSkillProcMember,
      settings,
      team: [guaranteedSkillProcMember],
      cookingState
    });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).skillProcs).toBe(1);
  });

  it('shall not proc skill for a sneaky snacker', () => {
    const memberState = new MemberState({
      member: sneakySnackingMember,
      settings,
      team: [sneakySnackingMember],
      cookingState
    });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).skillProcs).toBe(0);
  });

  it('shall still count metronome proc as 1 proc', () => {
    const member: TeamMember = {
      pokemonWithIngredients: {
        ...mockPokemonSet,
        pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100, skill: Metronome }
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
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    // fill inv
    memberState.attemptDayHelp(0);

    expect(memberState.results(1).skillProcs).toBe(1);
  });
});

describe('attemptNightHelp', () => {
  it('shall not perform night help if the time has not passed scheduled time', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(-1);

    expect(memberState.results(1).advanced.totalHelps).toEqual(0);
    expect(memberState.results(1).advanced.nightHelps).toEqual(0);
  });

  it('shall add 1 night help', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(0);

    expect(memberState.results(1).advanced.nightHelps).toEqual(1);
  });

  it('shall add any excess helps to sneaky snacking, and shall not roll skill proc on those', () => {
    const noCarryMember: TeamMember = { ...member, settings: { ...member.settings, carrySize: 0 } };
    const memberState = new MemberState({ member: noCarryMember, settings, team: [noCarryMember], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1).skillProcs).toEqual(0);
    expect(memberState.results(1).produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0)).toEqual(0);
    expect(memberState.results(1).advanced.nightHelps).toEqual(1);
    expect(memberState.results(1).advanced.totalHelps).toEqual(1);
  });

  it('shall roll skill proc on helps before inventory full at night, upon collecting in the morning', () => {
    const member: TeamMember = {
      pokemonWithIngredients: { ...mockPokemonSet, pokemon: { ...mockPokemonSet.pokemon, skillPercentage: 100 } },
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
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.wakeUp();
    memberState.collectInventory();
    memberState.attemptNightHelp(0);
    memberState.collectInventory();

    expect(memberState.results(1)).toMatchSnapshot();
  });
});

describe('degradeEnergy', () => {
  it('shall degrade energy by 1', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(100, memberState);
    memberState.degradeEnergy();
    expect(memberState.energy).toBe(99);
  });

  it('shall degrade by less than 1 if less than 1 energy left total', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    expect(memberState.energy).toBe(0);
    memberState.recoverEnergy(0.1, memberState);
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

describe('addSkillValue', () => {
  it('should count regular and crit value', () => {
    const memberState = new MemberState({ member, settings, team: [member], cookingState });
    memberState.addSkillValue({ regular: 10, crit: 20 });
    expect(memberState.results(1).advanced.skillCritValue).toBe(20);
    expect(memberState.results(1).skillAmount).toBe(30);
  });
});

describe('expert mode ingredient bonus', () => {
  // Builds a fake RNG with a fixed uint8 roll (forces an ingredient drop when
  // ingredientPercentage is 100%) and a scripted float sequence for specialist
  // bonus rolls inside rollExpertIngredientBonus.
  function fakeRng(floatRolls: number[] = []): PreGeneratedRandom {
    let floatIndex = 0;
    const fn = (() => {
      const value = floatRolls[floatIndex] ?? 0.99;
      floatIndex += 1;
      return value;
    }) as PreGeneratedRandom;
    fn.getUint8 = () => 255; // lands past ingredient0Threshold into an ingredient slot
    fn.getIndex = () => floatIndex;
    fn.randomElement = <T>(array: T[]) => array[0];
    return fn;
  }

  // Forces every roll to produce an ingredient by maxing ingredientPercentage.
  const ingredientFavoredMember = (overrides?: Partial<PokemonWithIngredients['pokemon']>): TeamMember => ({
    pokemonWithIngredients: {
      ...mockPokemonSet,
      pokemon: commonMocks.mockPokemon({
        carrySize: 10,
        frequency: 3600,
        berry: berry.BELUE,
        ingredient0: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
        ingredient30: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
        ingredient60: [{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }],
        ingredientPercentage: 100,
        skill: ChargeStrengthS,
        skillPercentage: 0,
        specialty: 'berry',
        ...overrides
      })
    },
    settings: {
      carrySize: 10,
      level: 60,
      ribbon: 0,
      nature: nature.BASHFUL,
      skillLevel: 6,
      subskills: new Set(),
      externalId: 'expert-test',
      sneakySnacking: false
    }
  });

  const withExpertMode = (
    randomBonus: 'ingredient' | 'berry' | 'skill',
    main = berry.BELUE,
    subs: (typeof berry.BELUE)[] = []
  ): TeamSettings => ({
    ...settings,
    island: commonMocks.islandInstance({
      expert: true,
      berries: DEFAULT_ISLAND.berries,
      expertMode: {
        mainFavoriteBerry: main,
        subFavoriteBerries: subs,
        randomBonus
      }
    })
  });

  it('grants +1 ingredient per help to non-specialist with the main favored berry', () => {
    const m = ingredientFavoredMember({ specialty: 'berry' });
    const memberState = new MemberState({
      member: m,
      settings: withExpertMode('ingredient'),
      team: [m],
      cookingState,
      rng: fakeRng()
    });

    const drop = memberState.rollBerriesAndIngredients();
    // base amount 1 + expert flat +1 = 2, no specialist roll applied
    const totalIngredient = drop.ingredient0Amount + drop.ingredient30Amount + drop.ingredient60Amount;
    expect(totalIngredient).toBe(2);
    expect(drop.berryAmount).toBe(0);
  });

  it('grants +1 ingredient per help when the pokemon berry matches a sub favored berry', () => {
    const m = ingredientFavoredMember({ specialty: 'berry' });
    const memberState = new MemberState({
      member: m,
      settings: withExpertMode('ingredient', berry.CHERI, [berry.BELUE]),
      team: [m],
      cookingState,
      rng: fakeRng()
    });

    const drop = memberState.rollBerriesAndIngredients();
    const totalIngredient = drop.ingredient0Amount + drop.ingredient30Amount + drop.ingredient60Amount;
    expect(totalIngredient).toBe(2);
  });

  it('grants an additional +1 to ingredient specialists when the runtime roll succeeds', () => {
    const m = ingredientFavoredMember({ specialty: 'ingredient' });
    const memberState = new MemberState({
      member: m,
      settings: withExpertMode('ingredient'),
      team: [m],
      cookingState,
      rng: fakeRng([0.1]) // < 0.5 triggers the extra +1
    });

    const drop = memberState.rollBerriesAndIngredients();
    // base 1 + flat +1 + specialist roll +1 = 3
    const totalIngredient = drop.ingredient0Amount + drop.ingredient30Amount + drop.ingredient60Amount;
    expect(totalIngredient).toBe(3);
  });

  it('only applies the flat +1 to ingredient specialists when the runtime roll fails', () => {
    const m = ingredientFavoredMember({ specialty: 'ingredient' });
    const memberState = new MemberState({
      member: m,
      settings: withExpertMode('ingredient'),
      team: [m],
      cookingState,
      rng: fakeRng([0.9]) // >= 0.5 skips the extra +1
    });

    const drop = memberState.rollBerriesAndIngredients();
    const totalIngredient = drop.ingredient0Amount + drop.ingredient30Amount + drop.ingredient60Amount;
    expect(totalIngredient).toBe(2);
  });

  it('leaves ingredient amounts untouched for a non-favored berry', () => {
    const m = ingredientFavoredMember({ berry: berry.LEPPA, specialty: 'ingredient' });
    const memberState = new MemberState({
      member: m,
      settings: withExpertMode('ingredient', berry.BELUE, [berry.CHERI]),
      team: [m],
      cookingState,
      rng: fakeRng([0.1]) // even if a specialist roll would succeed, nothing should apply
    });

    const drop = memberState.rollBerriesAndIngredients();
    const totalIngredient = drop.ingredient0Amount + drop.ingredient30Amount + drop.ingredient60Amount;
    expect(totalIngredient).toBe(1);
  });

  it('leaves ingredient amounts untouched when randomBonus is not ingredient', () => {
    const m = ingredientFavoredMember({ specialty: 'ingredient' });
    const memberState = new MemberState({
      member: m,
      settings: withExpertMode('berry'),
      team: [m],
      cookingState,
      rng: fakeRng([0.1])
    });

    const drop = memberState.rollBerriesAndIngredients();
    const totalIngredient = drop.ingredient0Amount + drop.ingredient30Amount + drop.ingredient60Amount;
    expect(totalIngredient).toBe(1);
  });

  it('leaves ingredient amounts untouched when expert mode is not configured on the island', () => {
    const m = ingredientFavoredMember({ specialty: 'ingredient' });
    const memberState = new MemberState({
      member: m,
      settings, // no expertMode on island
      team: [m],
      cookingState,
      rng: fakeRng([0.1])
    });

    const drop = memberState.rollBerriesAndIngredients();
    const totalIngredient = drop.ingredient0Amount + drop.ingredient30Amount + drop.ingredient60Amount;
    expect(totalIngredient).toBe(1);
  });
});
