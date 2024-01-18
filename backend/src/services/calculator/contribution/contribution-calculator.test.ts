import { CustomStats } from '../../../domain/combination/custom';
import { Contribution } from '../../../domain/computed/contribution';
import { GENGAR, PINSIR } from '../../../domain/pokemon/ingredient-pokemon';
import { FANCY_APPLE, FIERY_HERB, IngredientDrop, PURE_OIL, SNOOZY_TOMATO } from '../../../domain/produce/ingredient';
import { DREAM_EATER_BUTTER_CURRY, FANCY_APPLE_CURRY } from '../../../domain/recipe/curry';
import { JIGGLYPUFFS_FRUITY_FLAN, LOVELY_KISS_SMOOTHIE } from '../../../domain/recipe/dessert';
import { NINJA_SALAD, SLOWPOKE_TAIL_PEPPER_SALAD, SNOOZY_TOMATO_SALAD } from '../../../domain/recipe/salad';
import { SetCover } from '../../set-cover/set-cover';
import { createPokemonByIngredientReverseIndex, memo } from '../../set-cover/set-cover-utils';
import { calculateProducePerMealWindow } from '../ingredient/ingredient-calculate';
import { getOptimalIngredientStats } from '../stats/stats-calculator';
import {
  calculateContributionForMealWithPunishment,
  calculateMealContributionFor,
  excludeContributions,
  findBestContribution,
  getAllOptimalIngredientPokemonProduce,
  groupContributionsByType,
  selectTopNContributions,
  sortByContributedPowerDesc,
  sumContributedPower,
} from './contribution-calculator';

describe('getAllOptimalIngredientPokemonProduce', () => {
  it('shall calculate optimal produce for all optimal pokemon', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };

    const data = getAllOptimalIngredientPokemonProduce(false, islands);
    const pinsirData = data.filter((entry) => entry.pokemonCombination.pokemon === PINSIR);
    expect(pinsirData).toHaveLength(6);
  });
});

describe('calculateMealContributionFor', () => {
  it('shall calculate Gengars contribution and divide by 3 for slowpoke tail salad with size 3 team size', () => {
    const meal = SLOWPOKE_TAIL_PEPPER_SALAD;
    const pokemon = GENGAR;

    const customStats: CustomStats = getOptimalIngredientStats(60);
    const limit50 = false;
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };

    const detailedProduce = calculateProducePerMealWindow({
      pokemonCombination: {
        pokemon,
        ingredientList: [
          { amount: 2, ingredient: FIERY_HERB },
          { amount: 5, ingredient: FIERY_HERB },
          { amount: 8, ingredient: PURE_OIL },
        ],
      },
      customStats,
      e4eProcs: 0,
      helpingBonus: 0,
      goodCamp: false,
      combineIngredients: true,
    });

    const allPokemonWithProduce = getAllOptimalIngredientPokemonProduce(limit50, islands);
    const reverseIndex = createPokemonByIngredientReverseIndex(allPokemonWithProduce);

    const memoizedSetCover: SetCover = new SetCover(
      reverseIndex,
      {
        limit50,
        pokemon: allPokemonWithProduce.map((p) => p.pokemonCombination.pokemon.name),
      },
      memo
    );
    const contribution = calculateMealContributionFor({
      meal,
      producedIngredients: detailedProduce.produce.ingredients,
      memoizedSetCover,
    });

    expect(contribution.percentage).toBe(71.42857142857143);
    expect(contribution.contributedPower).toBe(6238.680175862951);
  });
});

describe('calculateContributionForMealWithPunishment', () => {
  it('shall not punish is recipe is done solo', () => {
    const producedTomato = { amount: 8, ingredient: SNOOZY_TOMATO };

    const data = calculateContributionForMealWithPunishment({
      meal: SNOOZY_TOMATO_SALAD,
      teamSize: 1,
      percentage: 100,
      producedIngredients: [producedTomato],
    });
    const expectedContribution =
      producedTomato.amount * 2.48 * SNOOZY_TOMATO.value * (1 + SNOOZY_TOMATO_SALAD.bonus / 100);

    expect(data.meal).toBe(SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(100);
    expect(data.contributedPower).toBe(expectedContribution);
  });

  it('shall punish by by 20% per additional team member for solution with size 3', () => {
    const producedTomato = { amount: 4, ingredient: SNOOZY_TOMATO };
    const expectedPunishment = 0.6;

    const data = calculateContributionForMealWithPunishment({
      meal: SNOOZY_TOMATO_SALAD,
      teamSize: 3,
      percentage: 50,
      producedIngredients: [producedTomato],
    });

    const expectedContribution =
      producedTomato.amount * 2.48 * SNOOZY_TOMATO.value * (1 + SNOOZY_TOMATO_SALAD.bonus / 100);

    expect(data.meal).toBe(SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedContribution * expectedPunishment);
  });

  it('shall not punish filler ingredients with team size', () => {
    const producedTomato: IngredientDrop = { amount: 4, ingredient: SNOOZY_TOMATO };
    const producedFiller: IngredientDrop = { amount: 4, ingredient: FANCY_APPLE };
    const expectedPunishment = 0.6;

    const data = calculateContributionForMealWithPunishment({
      meal: SNOOZY_TOMATO_SALAD,
      teamSize: 3,
      percentage: 50,
      producedIngredients: [producedTomato, producedFiller],
    });

    const expectedContribution =
      producedTomato.amount * 2.48 * SNOOZY_TOMATO.value * (1 + SNOOZY_TOMATO_SALAD.bonus / 100);
    const expectedFiller = producedFiller.amount * FANCY_APPLE.taxedValue;

    expect(data.meal).toBe(SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedContribution * expectedPunishment + expectedFiller);
  });

  it('shall count filler value only if no relevant ingredients were produced', () => {
    const producedFiller: IngredientDrop = { amount: 4, ingredient: FANCY_APPLE };

    const data = calculateContributionForMealWithPunishment({
      meal: SNOOZY_TOMATO_SALAD,
      teamSize: 3,
      percentage: 50,
      producedIngredients: [producedFiller],
    });

    const expectedFiller = producedFiller.amount * FANCY_APPLE.taxedValue;

    expect(data.meal).toBe(SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedFiller);
  });
});

describe('groupContributionsByType', () => {
  it('shall group contributions per recipe type', () => {
    const contributionCurry: Contribution = {
      contributedPower: 1,
      meal: DREAM_EATER_BUTTER_CURRY,
      percentage: 100,
    };
    const contributionSalad: Contribution = {
      contributedPower: 2,
      meal: NINJA_SALAD,
      percentage: 100,
    };
    const contributionDessert: Contribution = {
      contributedPower: 3,
      meal: JIGGLYPUFFS_FRUITY_FLAN,
      percentage: 100,
    };

    const groupedContributions = groupContributionsByType([contributionCurry, contributionSalad, contributionDessert]);
    expect(groupedContributions.curry.map((cont) => cont.meal.name)).toEqual([DREAM_EATER_BUTTER_CURRY.name]);
    expect(groupedContributions.salad.map((cont) => cont.meal.name)).toEqual([NINJA_SALAD.name]);
    expect(groupedContributions.dessert.map((cont) => cont.meal.name)).toEqual([JIGGLYPUFFS_FRUITY_FLAN.name]);
  });
});

describe('selectTopNContributions', () => {
  it('shall sort by contributed power and return the 2 best contributions', () => {
    const contribution1: Contribution = {
      contributedPower: 10,
      meal: LOVELY_KISS_SMOOTHIE,
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
      meal: LOVELY_KISS_SMOOTHIE,
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
      meal: LOVELY_KISS_SMOOTHIE,
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
      meal: LOVELY_KISS_SMOOTHIE,
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
      meal: LOVELY_KISS_SMOOTHIE,
      percentage: 100,
    };
    const contributionToExclude: Contribution = {
      contributedPower: 2,
      meal: FANCY_APPLE_CURRY,
      percentage: 50,
    };

    expect(excludeContributions([contribution, contributionToExclude], [contributionToExclude])).toEqual([
      contribution,
    ]);
  });
});
