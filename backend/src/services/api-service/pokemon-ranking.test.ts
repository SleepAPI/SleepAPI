import { PokemonCombinationForMealDAO } from '../../database/dao/pokemon-combination-for-meal-dao';
import { PokemonCombinationForMeal30DAO } from '../../database/dao/pokemon-combination-for-meal30-dao';
import { PINSIR } from '../../domain/pokemon/ingredient-pokemon';
import { DaoFixture } from '../../utils/test-utils/dao-fixture';
import { MockService } from '../../utils/test-utils/mock-service';
import { getPokemonCombinationData } from './pokemon-ranking';

DaoFixture.init();
beforeEach(() => {
  MockService.init({ PokemonCombinationForMealDAO });
});

afterEach(() => {
  MockService.restore();
});

describe('getPokemonCombinationData', () => {
  MockService.record({ PokemonCombinationForMealDAO }).getCombinationDataForPokemon = async () => [];
  MockService.record({ PokemonCombinationForMeal30DAO }).getCombinationDataForPokemon = async () => [];

  it('shall call DB get data function with correct params', async () => {
    const params = {
      name: PINSIR.name,
      limit30: false,
      advanced: false,
      unlocked: false,
      lategame: true,
      curry: false,
      salad: false,
      dessert: false,
    };
    await getPokemonCombinationData(params);
    expect(MockService.recorded).toMatchInlineSnapshot(`
      [
        {
          "PokemonCombinationForMealDAO.getCombinationDataForPokemon": [
            "PINSIR",
            [
              "EGG_BOMB_CURRY",
              "SPICY_LEEK_CURRY",
              "NINJA_CURRY",
              "GRILLED_TAIL_CURRY",
              "DREAM_EATER_BUTTER_CURRY",
              "GLUTTONY_POTATO_SALAD",
              "OVERHEAT_GINGER_SALAD",
              "SPORE_MUSHROOM_SALAD",
              "SLOWPOKE_TAIL_PEPPER_SALAD",
              "NINJA_SALAD",
              "LOVELY_KISS_SMOOTHIE",
              "STEADFAST_GINGER_COOKIES",
              "NEROLIS_RESTORATIVE_TEA",
              "JIGGLYPUFFS_FRUITY_FLAN",
            ],
          ],
        },
      ]
    `);
  });

  it('shall call DB30 get data function with correct params', async () => {
    const params = {
      name: PINSIR.name,
      limit30: true,
      advanced: false,
      unlocked: false,
      lategame: true,
      curry: false,
      salad: false,
      dessert: true,
    };
    await getPokemonCombinationData(params);
    expect(MockService.recorded).toMatchInlineSnapshot(`
      [
        {
          "PokemonCombinationForMeal30DAO.getCombinationDataForPokemon": [
            "PINSIR",
            [
              "LOVELY_KISS_SMOOTHIE",
              "STEADFAST_GINGER_COOKIES",
              "NEROLIS_RESTORATIVE_TEA",
              "JIGGLYPUFFS_FRUITY_FLAN",
            ],
          ],
        },
      ]
    `);
  });
});
