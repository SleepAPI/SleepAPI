import type { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom.js';
import type { ProductionStats } from '@src/domain/computed/production.js';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils.js';
import type { Produce, TimePeriod } from 'sleepapi-common';
import {
  BALANCED_GENDER,
  berry,
  emptyBerryInventory,
  ingredient,
  mainskill,
  maxCarrySize,
  nature,
  pokemon,
  subskill
} from 'sleepapi-common';

export const MOCKED_MAIN_SLEEP: TimePeriod = {
  start: {
    hour: 6,
    minute: 0,
    second: 0
  },
  end: {
    hour: 21,
    minute: 30,
    second: 0
  }
};

export const MOCKED_OPTIMAL_PRODUCTION_STATS: ProductionStats = {
  level: 60,
  ribbon: 0,
  nature: nature.QUIET,
  subskills: [subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_M, subskill.INGREDIENT_FINDER_S],
  e4eProcs: 0,
  e4eLevel: 6,
  cheer: 0,
  extraHelpful: 0,
  helperBoostUnique: 1,
  helperBoostProcs: 0,
  helperBoostLevel: 6,
  helpingBonus: 0,
  camp: false,
  erb: 0,
  incense: false,
  skillLevel: 6,
  mainBedtime: MOCKED_MAIN_SLEEP.end,
  mainWakeup: MOCKED_MAIN_SLEEP.start
};

export const MOCKED_PRODUCE: Produce = {
  berries: [
    {
      amount: 2,
      berry: berry.GREPA,
      level: 60
    }
  ],
  ingredients: [
    {
      amount: 1,
      ingredient: ingredient.FANCY_APPLE
    }
  ]
};

export const MOCKED_POKEMON: pokemon.Pokemon = {
  berry: berry.BELUE,
  genders: BALANCED_GENDER,
  carrySize: 20,
  frequency: 2500,
  ingredient0: {
    amount: 1,
    ingredient: ingredient.BEAN_SAUSAGE
  },
  ingredient30: [
    {
      amount: 2,
      ingredient: ingredient.FANCY_APPLE
    }
  ],
  ingredient60: [
    {
      amount: 3,
      ingredient: ingredient.FANCY_EGG
    }
  ],
  ingredientPercentage: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  name: 'MOCK_POKEMON',
  skill: mainskill.CHARGE_STRENGTH_M,
  skillPercentage: 2,
  specialty: 'skill'
};

export const MOCKED_POKEMON_WITH_PRODUCE: CustomPokemonCombinationWithProduce = {
  pokemonCombination: {
    pokemon: pokemon.PINSIR,
    ingredientList: [
      { amount: 2, ingredient: ingredient.HONEY },
      { amount: 5, ingredient: ingredient.FANCY_APPLE }
    ]
  },
  detailedProduce: {
    produce: {
      berries: emptyBerryInventory(),
      ingredients: [
        { amount: 2, ingredient: ingredient.HONEY },
        { amount: 5, ingredient: ingredient.FANCY_APPLE }
      ]
    },
    spilledIngredients: [],
    sneakySnack: emptyBerryInventory(),
    dayHelps: 0,
    nightHelps: 0,
    nightHelpsBeforeSS: 0,
    averageTotalSkillProcs: 0,
    skillActivations: []
  },
  averageProduce: InventoryUtils.getEmptyInventory(),
  customStats: {
    level: 30,
    ribbon: 0,
    nature: nature.RASH,
    subskills: [],
    skillLevel: 6,
    inventoryLimit: maxCarrySize(pokemon.PINSIR)
  }
};
