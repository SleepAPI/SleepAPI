import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { createDefaultProduceMap } from '@src/utils/tierlist-utils/tierlist-utils';
import { IngredientSet, curry, dessert, ingredient, nature, pokemon, salad, subskill } from 'sleepapi-common';
import { Contribution } from '../../../domain/computed/contribution';
import { createPokemonByIngredientReverseIndex, memo } from '../../../utils/set-cover-utils/set-cover-utils';
import { SetCover } from '../../set-cover/set-cover';
import {
  boostFirstMealWithFactor,
  calculateContributionForMealWithPunishment,
  calculateMealContributionFor,
  calculateTeamSizeAndSupportValue,
  excludeContributions,
  findBestContribution,
  getAllOptimalIngredientFocusedPokemonProduce,
  groupContributionsByType,
  selectTopNContributions,
  sortByContributedPowerDesc,
  sumContributedPower,
} from './contribution-calculator';

describe('getAllOptimalIngredientPokemonProduce', () => {
  it('shall calculate optimal produce for all optimal pokemon', () => {
    const data = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: false,
      cheer: 0,
      e4e: 0,
      extraHelpful: 0,
      monteCarloIterations: 1,
    });
    const pinsirData = data.filter((entry) => entry.pokemonCombination.pokemon === pokemon.PINSIR);
    expect(pinsirData).toHaveLength(6);
  });
});

describe('calculateMealContributionFor', () => {
  it('shall calculate Gengars contribution and divide by 3 for slowpoke tail salad with size 3 team size', () => {
    const meal = salad.SLOWPOKE_TAIL_PEPPER_SALAD;
    const pkmn = pokemon.GENGAR;

    const limit50 = false;

    const { detailedProduce } = setupAndRunProductionSimulation({
      pokemonCombination: {
        pokemon: pkmn,
        ingredientList: [
          { amount: 2, ingredient: ingredient.FIERY_HERB },
          { amount: 5, ingredient: ingredient.FIERY_HERB },
          { amount: 8, ingredient: ingredient.PURE_OIL },
        ],
      },
      input: {
        level: 60,
        nature: nature.RASH,
        subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S],
        e4e: 0,
        cheer: 0,
        extraHelpful: 0,
        erb: 0,
        camp: false,
        helpingBonus: 0,
        incense: false,
        skillLevel: 6,
        mainBedtime: { hour: 21, minute: 30, second: 0 },
        mainWakeup: { hour: 6, minute: 0, second: 0 },
      },
      monteCarloIterations: 1,
    });

    const allPokemonWithProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50,
      cheer: 0,
      extraHelpful: 0,
      e4e: 0,
      monteCarloIterations: 1,
    });
    const reverseIndex = createPokemonByIngredientReverseIndex(allPokemonWithProduce);

    const memoizedSetCover: SetCover = new SetCover(reverseIndex, memo);
    const contribution = calculateMealContributionFor({
      meal,
      producedIngredients: detailedProduce.produce.ingredients,
      memoizedSetCover,
      timeout: 1000,
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });

    expect(contribution.percentage).toBe(71.42857142857143);
    expect(contribution.contributedPower).toBe(6291.072652294875);
  });
});

describe('calculateContributionForMealWithPunishment', () => {
  it('shall not punish is recipe is done solo', () => {
    const producedTomato = { amount: 8, ingredient: ingredient.SNOOZY_TOMATO };

    const data = calculateContributionForMealWithPunishment({
      meal: salad.SNOOZY_TOMATO_SALAD,
      teamSize: 1,
      percentage: 100,
      producedIngredients: [producedTomato],
      supportedIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });
    const expectedContribution =
      producedTomato.amount * 2.48 * ingredient.SNOOZY_TOMATO.value * (1 + salad.SNOOZY_TOMATO_SALAD.bonus / 100);

    expect(data.meal).toBe(salad.SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(100);
    expect(data.contributedPower).toBe(expectedContribution);
  });

  it('shall punish by by 20% per additional team member for solution with size 3', () => {
    const producedTomato = { amount: 4, ingredient: ingredient.SNOOZY_TOMATO };
    const expectedPunishment = 0.6;

    const data = calculateContributionForMealWithPunishment({
      meal: salad.SNOOZY_TOMATO_SALAD,
      teamSize: 3,
      percentage: 50,
      producedIngredients: [producedTomato],
      supportedIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });

    const expectedContribution =
      producedTomato.amount * 2.48 * ingredient.SNOOZY_TOMATO.value * (1 + salad.SNOOZY_TOMATO_SALAD.bonus / 100);

    expect(data.meal).toBe(salad.SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedContribution * expectedPunishment);
  });

  it('shall not punish filler ingredients with team size', () => {
    const producedTomato: IngredientSet = { amount: 4, ingredient: ingredient.SNOOZY_TOMATO };
    const producedFiller: IngredientSet = { amount: 4, ingredient: ingredient.FANCY_APPLE };
    const expectedPunishment = 0.6;

    const data = calculateContributionForMealWithPunishment({
      meal: salad.SNOOZY_TOMATO_SALAD,
      teamSize: 3,
      percentage: 50,
      producedIngredients: [producedTomato, producedFiller],
      supportedIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });

    const expectedContribution =
      producedTomato.amount * 2.48 * ingredient.SNOOZY_TOMATO.value * (1 + salad.SNOOZY_TOMATO_SALAD.bonus / 100);
    const expectedFiller = producedFiller.amount * ingredient.FANCY_APPLE.taxedValue;

    expect(data.meal).toBe(salad.SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedContribution * expectedPunishment + expectedFiller);
  });

  it('shall count filler value only if no relevant ingredients were produced', () => {
    const producedFiller: IngredientSet = { amount: 4, ingredient: ingredient.FANCY_APPLE };

    const data = calculateContributionForMealWithPunishment({
      meal: salad.SNOOZY_TOMATO_SALAD,
      teamSize: 3,
      percentage: 50,
      producedIngredients: [producedFiller],
      supportedIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });

    const expectedFiller = producedFiller.amount * ingredient.FANCY_APPLE.taxedValue;

    expect(data.meal).toBe(salad.SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedFiller);
  });
});

describe('groupContributionsByType', () => {
  it('shall group contributions per recipe type', () => {
    const contributionCurry: Contribution = {
      contributedPower: 1,
      meal: curry.DREAM_EATER_BUTTER_CURRY,
      percentage: 100,
    };
    const contributionSalad: Contribution = {
      contributedPower: 2,
      meal: salad.NINJA_SALAD,
      percentage: 100,
    };
    const contributionDessert: Contribution = {
      contributedPower: 3,
      meal: dessert.JIGGLYPUFFS_FRUITY_FLAN,
      percentage: 100,
    };

    const groupedContributions = groupContributionsByType([contributionCurry, contributionSalad, contributionDessert]);
    expect(groupedContributions.curry.map((cont) => cont.meal.name)).toEqual([curry.DREAM_EATER_BUTTER_CURRY.name]);
    expect(groupedContributions.salad.map((cont) => cont.meal.name)).toEqual([salad.NINJA_SALAD.name]);
    expect(groupedContributions.dessert.map((cont) => cont.meal.name)).toEqual([dessert.JIGGLYPUFFS_FRUITY_FLAN.name]);
  });
});

describe('selectTopNContributions', () => {
  it('shall sort by contributed power and return the 2 best contributions', () => {
    const contribution1: Contribution = {
      contributedPower: 10,
      meal: dessert.LOVELY_KISS_SMOOTHIE,
      percentage: 100,
    };
    const contribution2: Contribution = {
      ...contribution1,
      contributedPower: 20,
    };
    const contribution3: Contribution = {
      ...contribution1,
      contributedPower: 15,
    };

    expect(selectTopNContributions([contribution1, contribution2, contribution3], 2)).toEqual([
      contribution2,
      contribution3,
    ]);
  });
});

describe('sortByContributedPowerDesc', () => {
  it('shall sort by contributed power', () => {
    const contribution1: Contribution = {
      contributedPower: 10,
      meal: dessert.LOVELY_KISS_SMOOTHIE,
      percentage: 100,
    };
    const contribution2: Contribution = {
      ...contribution1,
      contributedPower: 20,
    };

    expect([contribution1, contribution2].sort(sortByContributedPowerDesc)).toEqual([contribution2, contribution1]);
  });
});

describe('findBestContribution', () => {
  it('shall return the contribution with highest contributedPower', () => {
    const contribution1: Contribution = {
      contributedPower: 10,
      meal: dessert.LOVELY_KISS_SMOOTHIE,
      percentage: 100,
    };
    const contribution2: Contribution = {
      ...contribution1,
      contributedPower: 20,
    };

    expect(findBestContribution([contribution1, contribution2])).toBe(contribution2);
  });
});

describe('sumContributedPower', () => {
  it('shall sum all contributedPower into a final score', () => {
    const contribution1: Contribution = {
      contributedPower: 10,
      meal: dessert.LOVELY_KISS_SMOOTHIE,
      percentage: 100,
    };
    const contribution2: Contribution = {
      ...contribution1,
      contributedPower: 20,
    };

    expect(sumContributedPower([contribution1, contribution2])).toBe(30);
  });
});

describe('excludeContributions', () => {
  it('shall returned contributions without excluded contributions', () => {
    const contribution: Contribution = {
      contributedPower: 1,
      meal: dessert.LOVELY_KISS_SMOOTHIE,
      percentage: 100,
    };
    const contributionToExclude: Contribution = {
      contributedPower: 2,
      meal: curry.FANCY_APPLE_CURRY,
      percentage: 50,
    };

    expect(excludeContributions([contribution, contributionToExclude], [contributionToExclude])).toEqual([
      contribution,
    ]);
  });
});

describe('boostFirstMealWithFactor', () => {
  it('shall boost first meal with 1.5x factor', () => {
    const cont1: Contribution = {
      contributedPower: 200,
      meal: dessert.EXPLOSION_POPCORN,
      percentage: 100,
    };

    const cont2: Contribution = {
      contributedPower: 100,
      meal: dessert.LOVELY_KISS_SMOOTHIE,
      percentage: 100,
    };
    const resultWithBoost = boostFirstMealWithFactor(1.5, [cont1, cont2]);
    const prettifiedResult = resultWithBoost.map(
      (contribution) => `${contribution.meal.name}: ${contribution.contributedPower}`
    );

    expect(prettifiedResult).toEqual(['EXPLOSION_POPCORN: 300', 'LOVELY_KISS_SMOOTHIE: 100']);
  });
});

describe('calculateTeamSizeAndSupportValue', () => {
  it('shall calculate 0 support value with correct team size for non-support mons', () => {
    const allPokemonWithProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: false,
      cheer: 0,
      extraHelpful: 0,
      e4e: 0,
      monteCarloIterations: 1,
    });
    const reverseIndex = createPokemonByIngredientReverseIndex(allPokemonWithProduce);

    const memoizedSetCover: SetCover = new SetCover(reverseIndex, memo);

    const { teamSizeRequired, allSupportedIngredients } = calculateTeamSizeAndSupportValue({
      remainderOfRecipe: [{ ingredient: ingredient.FANCY_APPLE, amount: 10 }],
      memoizedSetCover,
      timeout: 1000,
    });

    expect(teamSizeRequired).toEqual(1);
    expect(allSupportedIngredients).toHaveLength(0);
  });

  it('shall calculate 0 support value with correct team size for non-support mons', () => {
    const defaultProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: false,
      cheer: 0,
      extraHelpful: 0,
      e4e: 0,
      monteCarloIterations: 1,
    });
    const allPokemonWithProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: false,
      cheer: 0,
      extraHelpful: 0,
      e4e: 3,
      monteCarloIterations: 1,
    });

    const reverseIndex = createPokemonByIngredientReverseIndex(allPokemonWithProduce);
    const memoizedSetCover: SetCover = new SetCover(reverseIndex, new Map());

    const allPokemonDefaultProduce = createDefaultProduceMap(defaultProduce);

    const { teamSizeRequired, allSupportedIngredients } = calculateTeamSizeAndSupportValue({
      remainderOfRecipe: [{ ingredient: ingredient.FANCY_APPLE, amount: 10 }],
      memoizedSetCover,
      timeout: 1000,
      allPokemonDefaultProduce,
    });

    expect(teamSizeRequired).toEqual(1);
    expect(allSupportedIngredients).not.toHaveLength(0);
  });
});
