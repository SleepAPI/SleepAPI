import {
  calculateIv,
  calculatePokemonProduction,
  calculateTeam
} from '@src/services/api-service/production/production-service.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { MOCKED_OPTIMAL_PRODUCTION_STATS } from '@src/utils/test-utils/defaults.js';
import type { TeamMember, TeamSettings } from 'sleepapi-common';
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
import { describe, expect, it } from 'vitest';

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
    const settings: TeamSettings = {
      bedtime: parseTime('21:30'),
      wakeup: parseTime('06:01'),
      camp: false,
      includeCooking: false,
      stockpiledIngredients: emptyIngredientInventoryFloat(),
      potSize: MIN_POT_SIZE,
      island: { ...DEFAULT_ISLAND }
    };

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
    const settings: TeamSettings = {
      bedtime: parseTime('22:00'),
      wakeup: parseTime('06:00'),
      camp: true,
      includeCooking: false,
      stockpiledIngredients: emptyIngredientInventoryFloat(),
      potSize: MIN_POT_SIZE,
      island: { ...DEFAULT_ISLAND }
    };

    const members: TeamMember[] = [
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

    const variants: TeamMember[] = [
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
