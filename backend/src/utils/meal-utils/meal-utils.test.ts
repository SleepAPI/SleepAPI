import { MealError } from '@src/domain/error/meal/meal-error';
import { recipe } from 'sleepapi-common';
import { getMeal, getMealsForFilter } from './meal-utils';

describe('getMeal', () => {
  it('shall return Lovely Kiss for lovely_kIsS_smOOthie name', () => {
    expect(getMeal('lovely_kIsS_smOOthie')).toBe(recipe.LOVELY_KISS_SMOOTHIE);
  });

  it("shall throw if Meal can't be found", () => {
    expect(() => getMeal('missing')).toThrow(MealError);
  });
});

describe('getMealsForFilter', () => {
  it('should return curry meals when curry is true', () => {
    expect(
      getMealsForFilter({
        curry: true,
        salad: false,
        dessert: false,
      })
    ).toEqual(recipe.CURRIES);
  });

  it('should return salad meals when salad is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: true,
        dessert: false,
      })
    ).toEqual(recipe.SALADS);
  });

  it('should return dessert meals when dessert is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: true,
      })
    ).toEqual(recipe.DESSERTS);
  });

  it('should return all meals when no specific filters are applied', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
      })
    ).toEqual(recipe.RECIPES);
  });

  it('shall return all meals above 35% bonus', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
        minRecipeBonus: 35,
      }).map((m) => m.name)
    ).toMatchInlineSnapshot(`
      [
        "DREAM_EATER_BUTTER_CURRY",
        "INFERNO_CORN_KEEMA_CURRY",
        "CALM_MIND_FRUIT_SALAD",
        "NINJA_SALAD",
        "GREENGRASS_SALAD",
        "EXPLOSION_POPCORN",
        "JIGGLYPUFFS_FRUITY_FLAN",
        "TEATIME_CORN_SCONES",
        "FLOWER_GIFT_MACARONS",
      ]
    `);
  });

  it('shall return all meals below pot limit 57', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
        maxPotSize: 57,
      }).map((m) => m.name)
    ).toMatchInlineSnapshot(`
      [
        "FANCY_APPLE_CURRY",
        "SIMPLE_CHOWDER",
        "MILD_HONEY_CURRY",
        "BEANBURGER_CURRY",
        "HEARTY_CHEESEBURGER_CURRY",
        "DROUGHT_KATSU_CURRY",
        "SOLAR_POWER_TOMATO_CURRY",
        "MELTY_OMELETTE_CURRY",
        "SOFT_POTATO_CHOWDER",
        "BULK_UP_BEAN_CURRY",
        "SPORE_MUSHROOM_CURRY",
        "EGG_BOMB_CURRY",
        "LIMBER_CORN_STEW",
        "SPICY_LEEK_CURRY",
        "NINJA_CURRY",
        "GRILLED_TAIL_CURRY",
        "DREAM_EATER_BUTTER_CURRY",
        "FANCY_APPLE_SALAD",
        "BEAN_HAM_SALAD",
        "SNOOZY_TOMATO_SALAD",
        "SNOW_CLOAK_CAESAR_SALAD",
        "WATER_VEIL_TOFU_SALAD",
        "HEAT_WAVE_TOFU_SALAD",
        "FURY_ATTACK_CORN_SALAD",
        "DAZZLING_APPLE_CHEESE_SALAD",
        "MOOMOO_CAPRESE_SALAD",
        "IMMUNITY_LEEK_SALAD",
        "SUPERPOWER_EXTREME_SALAD",
        "CONTRARY_CHOCOLATE_MEAT_SALAD",
        "GLUTTONY_POTATO_SALAD",
        "OVERHEAT_GINGER_SALAD",
        "SPORE_MUSHROOM_SALAD",
        "CALM_MIND_FRUIT_SALAD",
        "SLOWPOKE_TAIL_PEPPER_SALAD",
        "NINJA_SALAD",
        "WARM_MOOMOO_MILK",
        "FANCY_APPLE_JUICE",
        "CRAFT_SODA_POP",
        "LUCKY_CHANT_APPLE_PIE",
        "FLUFFY_SWEET_POTATOES",
        "EMBER_GINGER_TEA",
        "CLOUD_NINE_SOY_CAKE",
        "STALWART_VEGETABLE_JUICE",
        "BIG_MALASADA",
        "HUSTLE_PROTEIN_SMOOTHIE",
        "HUGE_POWER_SOY_DONUTS",
        "SWEET_SCENT_CHOCOLATE_CAKE",
        "PETAL_DANCE_CHOCOLATE_TART",
        "LOVELY_KISS_SMOOTHIE",
        "STEADFAST_GINGER_COOKIES",
        "NEROLIS_RESTORATIVE_TEA",
        "EXPLOSION_POPCORN",
        "JIGGLYPUFFS_FRUITY_FLAN",
      ]
    `);
  });
});
