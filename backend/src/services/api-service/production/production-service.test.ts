import {
  calculateIv,
  calculatePokemonProduction,
  calculateTeam
} from '@src/services/api-service/production/production-service.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { MOCKED_OPTIMAL_PRODUCTION_STATS } from '@src/utils/test-utils/defaults.js';
import type { TeamMemberExt, TeamSettingsExt } from 'sleepapi-common';
import {
  BULBASAUR,
  CHARMANDER,
  DEFAULT_ISLAND,
  emptyIngredientInventoryFloat,
  ingredient,
  MIN_POT_SIZE,
  nature,
  parseTime,
  PINSIR,
  subskill
} from 'sleepapi-common';
import { describe, expect, it, vi } from 'vitest';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { mocks } from '@src/vitest/index.js';

describe('calculatePokemonProduction', () => {
  it('should calculate production for PINSIR with given details', () => {
    const result = calculatePokemonProduction(
      PINSIR,
      MOCKED_OPTIMAL_PRODUCTION_STATS,
      [ingredient.HONEY.name, ingredient.FANCY_APPLE.name, ingredient.BEAN_SAUSAGE.name],
      false,
      1
    );

    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('production');
    expect(result).toHaveProperty('log');
    expect(result).toHaveProperty('summary');
    expect(result.neutralProduction).toBeUndefined;
    expect(result.optimalIngredientProduction).toBeUndefined;
    expect(result.optimalBerryProduction).toBeUndefined;
    expect(result.optimalSkillProduction).toBeUndefined;

    expect(result.filters).toEqual(MOCKED_OPTIMAL_PRODUCTION_STATS);
  });

  it('should calculate production for PINSIR with production analysis', () => {
    const result = calculatePokemonProduction(
      PINSIR,
      MOCKED_OPTIMAL_PRODUCTION_STATS,
      [ingredient.HONEY.name, ingredient.FANCY_APPLE.name, ingredient.BEAN_SAUSAGE.name],
      true,
      1
    );

    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('production');
    expect(result).toHaveProperty('log');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('neutralProduction');
    expect(result).toHaveProperty('optimalIngredientProduction');
    expect(result).toHaveProperty('optimalBerryProduction');
    expect(result).toHaveProperty('optimalSkillProduction');

    expect(result.filters).toEqual(MOCKED_OPTIMAL_PRODUCTION_STATS);
  });
});

describe('calculateTeam', () => {
  it('shall calculate production with uneven sleep times', () => {
    const settings: TeamSettingsExt = {
      bedtime: parseTime('21:30'),
      wakeup: parseTime('06:01'),
      camp: false,
      includeCooking: false,
      stockpiledIngredients: emptyIngredientInventoryFloat(),
      potSize: MIN_POT_SIZE,
      island: { ...DEFAULT_ISLAND }
    };

    const members: TeamMemberExt[] = [
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
          carrySize: PINSIR.carrySize,
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

    const result = calculateTeam({ members, settings, userRecipes: defaultUserRecipes() }, 5000);

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal).toMatchInlineSnapshot(`
      {
        "berries": [
          {
            "amount": 40.7858,
            "berry": {
              "name": "LUM",
              "type": "bug",
              "value": 24,
            },
            "level": 60,
          },
        ],
        "ingredients": [
          {
            "amount": 90.50740051269531,
            "ingredient": {
              "longName": "Honey",
              "name": "Honey",
              "taxedValue": 29.8,
              "value": 101,
            },
          },
        ],
      }
    `);
  });
});

describe('calculateIv', () => {
  it('should calculate IVs for a given team and variants', () => {
    const settings: TeamSettingsExt = {
      bedtime: parseTime('22:00'),
      wakeup: parseTime('06:00'),
      camp: true,
      includeCooking: false,
      stockpiledIngredients: emptyIngredientInventoryFloat(),
      potSize: MIN_POT_SIZE,
      island: { ...DEFAULT_ISLAND }
    };

    const members: TeamMemberExt[] = [
      {
        pokemonWithIngredients: {
          pokemon: BULBASAUR,
          ingredientList: [{ amount: 3, ingredient: ingredient.FANCY_APPLE }]
        },
        settings: {
          carrySize: BULBASAUR.carrySize,
          level: 15,
          ribbon: 0,
          nature: nature.JOLLY,
          skillLevel: 4,
          subskills: new Set([subskill.HELPING_SPEED_S.name]),
          externalId: 'bulbasaur-1',
          sneakySnacking: false
        }
      }
    ];

    const variants: TeamMemberExt[] = [
      {
        pokemonWithIngredients: {
          pokemon: CHARMANDER,
          ingredientList: [{ amount: 2, ingredient: ingredient.HONEY }]
        },
        settings: {
          carrySize: CHARMANDER.carrySize,
          level: 12,
          ribbon: 0,
          nature: nature.BRAVE,
          skillLevel: 3,
          subskills: new Set([subskill.SKILL_TRIGGER_S.name]),
          externalId: 'charmander-variant',
          sneakySnacking: false
        }
      }
    ];

    const result = calculateIv({ settings, members, variants });

    expect(result.variants).toHaveLength(1);
    expect(result.variants[0]).toHaveProperty('externalId', 'charmander-variant');
    expect(result.variants[0]).toHaveProperty('produceTotal');
    expect(result.variants[0].produceTotal.ingredients).toBeDefined();
    expect(result.variants[0].produceTotal.berries).toBeDefined();
  });
});

describe('scheduled IVs', () => {
  it('replaces every occurrence of the selected Pokemon with each variant without mutating the schedule', () => {
    const original = mocks.teamMemberExt({
      pokemonWithIngredients: { pokemon: CHARMANDER, ingredientList: [{ ingredient: ingredient.HONEY, amount: 2 }] }
    });
    const variant = { ...original, settings: { ...original.settings, externalId: 'variant' } };
    const partner = { ...original, settings: { ...original.settings, externalId: 'partner' } };
    const schedule = [
      { slotIndex: 0, externalId: 'original', startTime: '06:00' },
      { slotIndex: 0, externalId: 'partner', startTime: '12:00' },
      { slotIndex: 0, externalId: 'original', startTime: '18:00' }
    ];
    const result = calculateIv(
      {
        settings: mocks.teamSettingsExt({ schedule }),
        members: [partner],
        variants: [variant],
        replacedMemberId: 'original'
      },
      2
    );
    expect(result.variants[0].produceTotal.berries.reduce((sum, berry) => sum + berry.amount, 0)).toBeGreaterThan(0);
    expect(schedule.map((shift) => shift.externalId)).toEqual(['original', 'partner', 'original']);
  });

  it('requires the original build for target-based comparisons', () => {
    expect(() =>
      calculateIv(
        {
          settings: mocks.teamSettingsExt({
            schedule: [
              { slotIndex: 0, externalId: 'original', startTime: '06:00', type: 'pot-size', potSizeTarget: 200 }
            ]
          }),
          members: [],
          variants: [],
          replacedMemberId: 'original'
        },
        1
      )
    ).toThrow('Target-based IV calculations require the original member');
  });

  it('returns reference production from the same working windows as an identical variant', () => {
    const referenceMember = mocks.teamMemberExt({
      pokemonWithIngredients: { pokemon: CHARMANDER, ingredientList: [{ ingredient: ingredient.HONEY, amount: 2 }] }
    });
    const id = referenceMember.settings.externalId;
    const variant = { ...referenceMember, settings: { ...referenceMember.settings, externalId: 'variant' } };
    const partner = { ...referenceMember, settings: { ...referenceMember.settings, externalId: 'partner' } };
    const result = calculateIv(
      {
        settings: mocks.teamSettingsExt({
          includeCooking: true,
          schedule: [
            { slotIndex: 0, externalId: id, startTime: '06:00', type: 'pot-size', potSizeTarget: 200 },
            { slotIndex: 0, externalId: 'partner', startTime: '06:05', type: 'pot-size' }
          ]
        }),
        members: [partner],
        variants: [variant],
        replacedMemberId: id,
        referenceMember
      },
      8
    );
    expect(result.reference).toBeDefined();
    expect(result.reference!.produceTotal).toEqual(result.variants[0].produceTotal);
    expect(result.reference!.skillProcs).toEqual(result.variants[0].skillProcs);
    expect(result.reference!.produceTotal.berries.reduce((sum, berry) => sum + berry.amount, 0)).toBeGreaterThan(0);
  });

  it('runs cooking during conditional IV simulations so meal bonuses can reset', () => {
    const original = mocks.teamMemberExt({
      pokemonWithIngredients: { pokemon: CHARMANDER, ingredientList: [{ ingredient: ingredient.HONEY, amount: 2 }] }
    });
    const variant = { ...original, settings: { ...original.settings, externalId: 'variant' } };
    const partner = { ...original, settings: { ...original.settings, externalId: 'partner' } };
    const cook = vi.spyOn(CookingState.prototype, 'cook');
    try {
      calculateIv(
        {
          settings: mocks.teamSettingsExt({
            includeCooking: true,
            schedule: [
              { slotIndex: 0, externalId: 'original', startTime: '06:00', type: 'pot-size', potSizeTarget: 200 },
              { slotIndex: 0, externalId: 'partner', startTime: '06:05', type: 'pot-size' }
            ]
          }),
          members: [partner],
          variants: [variant],
          replacedMemberId: 'original',
          referenceMember: { ...original, settings: { ...original.settings, externalId: 'original' } }
        },
        1
      );
      expect(cook).toHaveBeenCalledTimes(6);
    } finally {
      cook.mockRestore();
    }
  });
});
