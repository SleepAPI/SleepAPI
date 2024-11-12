import { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
import { MOCKED_OPTIMAL_PRODUCTION_STATS } from '@src/utils/test-utils/defaults';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { ingredient, nature, pokemon, subskill } from 'sleepapi-common';
import { calculateIv, calculatePokemonProduction, calculateTeam } from './production-service';

describe('calculatePokemonProduction', () => {
  it('should calculate production for PINSIR with given details', () => {
    const result = calculatePokemonProduction(
      pokemon.PINSIR,
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
      pokemon.PINSIR,
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
        externalId: 'some id',
      },
    ];

    const result = calculateTeam({ members, settings }, 5000);

    expect(result.members).toHaveLength(1);
    expect(result.members[0].produceTotal).toMatchInlineSnapshot(`
      {
        "berries": [
          {
            "amount": 39.98336504575599,
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
            "amount": 90.93165396225288,
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
      bedtime: TimeUtils.parseTime('22:00'),
      wakeup: TimeUtils.parseTime('06:00'),
      camp: true,
    };

    const members: TeamMember[] = [
      {
        pokemonSet: {
          pokemon: pokemon.BULBASAUR,
          ingredientList: [{ amount: 3, ingredient: ingredient.FANCY_APPLE }],
        },
        carrySize: 10,
        level: 15,
        ribbon: 0,
        nature: nature.JOLLY,
        skillLevel: 4,
        subskills: [subskill.HELPING_SPEED_S],
        externalId: 'bulbasaur-1',
      },
    ];

    const variants: TeamMember[] = [
      {
        pokemonSet: {
          pokemon: pokemon.CHARMANDER,
          ingredientList: [{ amount: 2, ingredient: ingredient.HONEY }],
        },
        carrySize: 8,
        level: 12,
        ribbon: 0,
        nature: nature.BRAVE,
        skillLevel: 3,
        subskills: [subskill.SKILL_TRIGGER_S],
        externalId: 'charmander-variant',
      },
    ];

    const result = calculateIv({ settings, members, variants });

    expect(result.variants).toHaveLength(1);
    expect(result.variants[0]).toHaveProperty('externalId', 'charmander-variant');
    expect(result.variants[0]).toHaveProperty('produceTotal');
    expect(result.variants[0].produceTotal.ingredients).toBeDefined();
    expect(result.variants[0].produceTotal.berries).toBeDefined();
  });
});
