/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { hashPokemonCombination } from '@src/utils/optimal-utils/optimal-utils';
import { createProduceMap } from '@src/utils/tierlist-utils/tierlist-utils';
import {
  IngredientSet,
  MAX_RECIPE_LEVEL,
  MathUtils,
  Recipe,
  curry,
  dessert,
  ingredient,
  maxCarrySize,
  nature,
  pokemon,
  prettifyIngredientDrop,
  recipeLevelBonus,
  salad,
  subskill,
} from 'sleepapi-common';
import { Contribution } from '../../../domain/computed/contribution';
import { createPokemonByIngredientReverseIndex, memo } from '../../../utils/set-cover-utils/set-cover-utils';
import { SetCover } from '../../set-cover/set-cover';
import { emptyBerrySet } from '../berry/berry-calculator';
import {
  boostFirstMealWithFactor,
  calculateContributionForMealWithPunishment,
  calculateMealContributionFor,
  calculateTeamSizeAndSupportedIngredients,
  excludeContributions,
  findBestContribution,
  getAllOptimalIngredientFocusedPokemonProduce,
  groupContributionsByType,
  selectTopNContributions,
  sortByContributedPowerDesc,
  sumContributedPower,
  summarizeTeamProducedIngredientSources,
} from './contribution-calculator';

describe('getAllOptimalIngredientPokemonProduce', () => {
  it('shall calculate optimal produce for all optimal pokemon', () => {
    const data = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: false,
      cheer: 0,
      e4eProcs: 0,
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

    const allPokemonWithProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: false,
      cheer: 0,
      extraHelpful: 0,
      e4eProcs: 0,
      monteCarloIterations: 1,
    });
    const reverseIndex = createPokemonByIngredientReverseIndex(allPokemonWithProduce);
    const currentPokemon = reverseIndex
      .get(ingredient.PURE_OIL.name)!
      .filter(
        (pk) =>
          hashPokemonCombination(pk.pokemonCombination) ===
          `${pokemon.GENGAR.name}:${[
            ingredient.FIERY_HERB.name,
            ingredient.FIERY_HERB.name,
            ingredient.PURE_OIL.name,
          ].join(',')}`
      )[0];

    const defaultProduceMap = createProduceMap(allPokemonWithProduce);

    const memoizedSetCover: SetCover = new SetCover(reverseIndex, memo);
    const contribution = calculateMealContributionFor({
      meal,
      currentPokemon,
      memoizedSetCover,
      timeout: 1000,
      critMultiplier: 1,
      defaultCritMultiplier: 1,
      defaultProduceMap,
    });

    expect(contribution.percentage).toBe(71.42857142857143);
    expect(contribution.contributedPower).toBe(6873.912101094876);
  });

  it('shall calculate Gengars level 50 contribution and divide by 2 for spore mushroom curry with size 2 team size', () => {
    const meal = curry.SPORE_MUSHROOM_CURRY;

    const allPokemonWithProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: true,
      cheer: 0,
      extraHelpful: 0,
      e4eProcs: 0,
      monteCarloIterations: 1,
    });
    const reverseIndex = createPokemonByIngredientReverseIndex(allPokemonWithProduce);
    const defaultProduceMap = createProduceMap(allPokemonWithProduce);

    const memoizedSetCover: SetCover = new SetCover(reverseIndex, new Map());
    const currentPokemon = reverseIndex
      .get(ingredient.TASTY_MUSHROOM.name)!
      .filter((pk) => pk.pokemonCombination.pokemon.name === pokemon.GENGAR.name)[0];

    const contribution = calculateMealContributionFor({
      meal,
      currentPokemon,
      memoizedSetCover,
      timeout: 1000,
      critMultiplier: 1.17,
      defaultCritMultiplier: 1.17,
      defaultProduceMap,
    });

    expect(Math.round(contribution.percentage)).toBe(61);
    expect(Math.round(contribution.contributedPower)).toBe(7431);
    expect(Math.round(contribution.contributedPower * 1.5)).toBe(11147); // expected value in overall 50 tier list
  });

  it('shall calculate an extra helpful mon that solos recipe, but needs support produce to do so', () => {
    const meal = dessert.WARM_MOOMOO_MILK;

    // default calced
    const defaultPokemonWithProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: true,
      cheer: 0,
      extraHelpful: 0,
      e4eProcs: 0,
      monteCarloIterations: 1,
    });
    const defaultReverseIndex = createPokemonByIngredientReverseIndex(defaultPokemonWithProduce);
    const defaultProduceMap = createProduceMap(defaultPokemonWithProduce);
    const defaultCurrentPokemon = defaultReverseIndex
      .get(ingredient.MOOMOO_MILK.name)!
      .filter((pk) => pk.pokemonCombination.pokemon.name === pokemon.JOLTEON.name)[0];

    // support calced
    const supportBoostedProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: true,
      cheer: 0,
      extraHelpful: defaultCurrentPokemon.detailedProduce.averageTotalSkillProcs,
      e4eProcs: 0,
      monteCarloIterations: 1,
    });
    const reverseIndex = createPokemonByIngredientReverseIndex(supportBoostedProduce);
    const preCalcedSupportMap = createProduceMap(supportBoostedProduce);
    const currentPokemon = reverseIndex
      .get(ingredient.MOOMOO_MILK.name)!
      .filter((pk) => pk.pokemonCombination.pokemon.name === pokemon.JOLTEON.name)[0];

    const memoizedSetCover: SetCover = new SetCover(reverseIndex, new Map());

    const contribution = calculateMealContributionFor({
      meal,
      currentPokemon,
      memoizedSetCover,
      timeout: 1000,
      critMultiplier: 1.17,
      defaultCritMultiplier: 1.17,
      defaultProduceMap,
      preCalcedSupportMap,
    });

    const totalDefaultMilkProduceAmount = defaultCurrentPokemon.detailedProduce.produce.ingredients.reduce(
      (sum, cur) => sum + cur.amount,
      0
    );
    const totalSupportedMilkProduceAmount = currentPokemon.detailedProduce.produce.ingredients.reduce(
      (sum, cur) => sum + cur.amount,
      0
    );

    const teamPenalty = 1;
    const critMultiplier = 1.17;

    const expectedBaseUsed =
      totalDefaultMilkProduceAmount *
      ingredient.MOOMOO_MILK.value *
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
      teamPenalty *
      critMultiplier *
      (1 + meal.bonus / 100);

    const expectedBaseFiller = 0; // mon doesnt produce enough base to meet recipe

    const expectedSupportedUsed =
      (meal.ingredients[0].amount - totalDefaultMilkProduceAmount) *
      ingredient.MOOMOO_MILK.value *
      teamPenalty *
      critMultiplier *
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
      (1 + meal.bonus / 100);

    const expectedSupportedFiller =
      (totalSupportedMilkProduceAmount - meal.ingredients[0].amount) * ingredient.MOOMOO_MILK.taxedValue;

    expect(Math.round(contribution.percentage)).toBe(100);
    expect(Math.round(contribution.skillValue!)).toBe(Math.round(expectedSupportedUsed + expectedSupportedFiller));
    expect(Math.round(contribution.contributedPower)).toBe(
      Math.round(expectedBaseUsed + expectedBaseFiller + expectedSupportedUsed + expectedSupportedFiller)
    );
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
      fillerSupportIngredients: [],
      usedSupportIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });
    const expectedContribution =
      producedTomato.amount *
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
      ingredient.SNOOZY_TOMATO.value *
      (1 + salad.SNOOZY_TOMATO_SALAD.bonus / 100);

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
      fillerSupportIngredients: [],
      usedSupportIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });

    const expectedContribution =
      producedTomato.amount *
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
      ingredient.SNOOZY_TOMATO.value *
      (1 + salad.SNOOZY_TOMATO_SALAD.bonus / 100);

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
      fillerSupportIngredients: [],
      usedSupportIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });

    const expectedContribution =
      producedTomato.amount *
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
      ingredient.SNOOZY_TOMATO.value *
      (1 + salad.SNOOZY_TOMATO_SALAD.bonus / 100);
    const expectedFiller = producedFiller.amount * ingredient.FANCY_APPLE.taxedValue;

    expect(data.meal).toBe(salad.SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedContribution * expectedPunishment + expectedFiller);
  });

  it('shall only count filler value if no relevant ingredients were produced', () => {
    const producedFiller: IngredientSet = { amount: 4, ingredient: ingredient.FANCY_APPLE };

    const data = calculateContributionForMealWithPunishment({
      meal: salad.SNOOZY_TOMATO_SALAD,
      teamSize: 3,
      percentage: 50,
      producedIngredients: [producedFiller],
      usedSupportIngredients: [],
      fillerSupportIngredients: [],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });

    const expectedFiller = producedFiller.amount * ingredient.FANCY_APPLE.taxedValue;

    expect(data.meal).toBe(salad.SNOOZY_TOMATO_SALAD);
    expect(data.percentage).toBe(50);
    expect(data.contributedPower).toBe(expectedFiller);
  });

  it('shall count used support with recipe bonus and filler support as taxed filler', () => {
    const support: IngredientSet = { amount: 2, ingredient: ingredient.FANCY_APPLE };

    const data = calculateContributionForMealWithPunishment({
      meal: salad.SNOOZY_TOMATO_SALAD,
      teamSize: 2,
      percentage: 50,
      producedIngredients: [],
      usedSupportIngredients: [support],
      fillerSupportIngredients: [support],
      critMultiplier: 1,
      defaultCritMultiplier: 1,
    });
    const teamPenalty = 0.8;

    const expectedUsedSupportValue =
      teamPenalty *
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
      (1 + salad.SNOOZY_TOMATO_SALAD.bonus / 100) *
      support.amount *
      ingredient.FANCY_APPLE.value;

    const expectedFillerSupportValue = support.amount * ingredient.FANCY_APPLE.taxedValue;

    // contributedPower and skillValue same since no regular ingredients were produced in this case
    expect(data.contributedPower).toBe(expectedUsedSupportValue + expectedFillerSupportValue);
    expect(data.skillValue).toBe(expectedUsedSupportValue + expectedFillerSupportValue);
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
  it('shall calculate a L60 helper boost mon', () => {
    const raikou = generateProducingPokemon({
      pokemon: pokemon.RAIKOU,
      skillProcs: 5.3,
      average: [
        {
          amount: 0.30333333333333334,
          ingredient: ingredient.FIERY_HERB,
        },
      ],
      produced: [
        {
          amount: 6.875555555555554,
          ingredient: ingredient.FIERY_HERB,
        },
      ],
    });

    const dragonite = generateProducingPokemon({
      pokemon: pokemon.DRAGONITE,
      skillProcs: 0,
      average: [
        {
          amount: 1.1,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 1.1,
          ingredient: ingredient.GREENGRASS_CORN,
        },
      ],
      produced: [
        {
          amount: 27.6,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 27.6,
          ingredient: ingredient.GREENGRASS_CORN,
        },
      ],
    });

    const tyranitar = generateProducingPokemon({
      pokemon: pokemon.TYRANITAR,
      skillProcs: 0,
      average: [
        {
          amount: 1.1,
          ingredient: ingredient.WARMING_GINGER,
        },
        {
          amount: 1.3,
          ingredient: ingredient.BEAN_SAUSAGE,
        },
      ],
      produced: [
        {
          amount: 27.1,
          ingredient: ingredient.WARMING_GINGER,
        },
        {
          amount: 30.9,
          ingredient: ingredient.BEAN_SAUSAGE,
        },
      ],
    });

    const defaultProduce: CustomPokemonCombinationWithProduce[] = [raikou, dragonite, tyranitar];

    const reverseIndex = createPokemonByIngredientReverseIndex(defaultProduce);
    const memoizedSetCover: SetCover = new SetCover(reverseIndex, new Map());

    const defaultProduceMap = createProduceMap(defaultProduce);
    const currentPokemon = raikou;

    const { teamSizeRequired, supportedUsedIngredients, supportedFillerIngredients } =
      calculateTeamSizeAndSupportedIngredients({
        recipe: curry.INFERNO_CORN_KEEMA_CURRY,
        currentPokemonDefault: currentPokemon,
        currentPokemon,
        memoizedSetCover,
        timeout: 1000,
        defaultProduceMap,
      });

    expect(teamSizeRequired).toEqual(3);
    expect(prettifyIngredientDrop(supportedUsedIngredients)).toMatchInlineSnapshot(
      `"7.2 Herb, 3.6 Corn, 3.2 Ginger, 6.5 Sausage"`
    );
    expect(prettifyIngredientDrop(supportedFillerIngredients)).toMatchInlineSnapshot(
      `"5.2 Herb, 6.1 Corn, 6.5 Ginger, 5 Sausage"`
    );
  });

  it('shall calculate a L50 helper boost mon', () => {
    const raikou = generateProducingPokemon({
      pokemon: pokemon.RAIKOU,
      skillProcs: 5.2,
      average: [
        {
          amount: 0.2,
          ingredient: ingredient.FIERY_HERB,
        },
      ],
      produced: [
        {
          amount: 4.4,
          ingredient: ingredient.FIERY_HERB,
        },
      ],
    });

    const dragonite = generateProducingPokemon({
      pokemon: pokemon.DRAGONITE,
      skillProcs: 0,
      average: [
        {
          amount: 0.5,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 1,
          ingredient: ingredient.GREENGRASS_CORN,
        },
      ],
      produced: [
        {
          amount: 12.2,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 24.5,
          ingredient: ingredient.GREENGRASS_CORN,
        },
      ],
    });

    const charizard = generateProducingPokemon({
      pokemon: pokemon.CHARIZARD,
      skillProcs: 0,
      average: [
        {
          amount: 1.4,
          ingredient: ingredient.BEAN_SAUSAGE,
        },
      ],
      produced: [
        {
          amount: 0.47,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 0.47,
          ingredient: ingredient.GREENGRASS_CORN,
        },
        {
          amount: 0.47,
          ingredient: ingredient.WARMING_GINGER,
        },
        {
          amount: 32.9,
          ingredient: ingredient.BEAN_SAUSAGE,
        },
      ],
    });

    const houndoom = generateProducingPokemon({
      pokemon: pokemon.HOUNDOOM,
      skillProcs: 0,
      average: [
        {
          amount: 0.2,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 0.6,
          ingredient: ingredient.WARMING_GINGER,
        },
      ],
      produced: [
        {
          amount: 3.1,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 9.3,
          ingredient: ingredient.WARMING_GINGER,
        },
      ],
    });

    const defaultProduce: CustomPokemonCombinationWithProduce[] = [raikou, dragonite, charizard, houndoom];

    const reverseIndex = createPokemonByIngredientReverseIndex(defaultProduce);
    const memoizedSetCover: SetCover = new SetCover(reverseIndex, new Map());

    const defaultProduceMap = createProduceMap(defaultProduce);
    const currentPokemon = raikou;

    const { teamSizeRequired, supportedUsedIngredients, supportedFillerIngredients } =
      calculateTeamSizeAndSupportedIngredients({
        recipe: curry.INFERNO_CORN_KEEMA_CURRY,
        currentPokemonDefault: currentPokemon,
        currentPokemon,
        memoizedSetCover,
        timeout: 1000,
        defaultProduceMap,
      });

    expect(teamSizeRequired).toEqual(5);
    expect(prettifyIngredientDrop(supportedUsedIngredients)).toMatchInlineSnapshot(
      `"7.8 Herb, 3.6 Corn, 4.2 Ginger, 6.5 Sausage"`
    );
    expect(prettifyIngredientDrop(supportedFillerIngredients)).toMatchInlineSnapshot(
      `"1.7 Herb, 5.1 Corn, 6.2 Ginger, 5.7 Sausage"`
    );
  });

  it('shall calculate a support mon with both relevant and irrelevant supported ingredients', () => {
    // default jolteon is 10 milk 1 cacao, recipe needs 12 milk, supported jolteon is 12 milk 2 cacao
    // the 2 milk is needed, so counted as used, the 1 boosted cacao is filler
    const defaultJolteon = generateProducingPokemon({
      pokemon: pokemon.JOLTEON,
      skillProcs: 0,
      average: [],
      produced: [
        {
          amount: 10,
          ingredient: ingredient.MOOMOO_MILK,
        },
        {
          amount: 1,
          ingredient: ingredient.SOOTHING_CACAO,
        },
      ],
    });

    const supportJolteon = generateProducingPokemon({
      pokemon: pokemon.JOLTEON,
      skillProcs: 0,
      average: [],
      produced: [
        {
          amount: 12,
          ingredient: ingredient.MOOMOO_MILK,
        },
        {
          amount: 2,
          ingredient: ingredient.SOOTHING_CACAO,
        },
      ],
    });

    const defaultProduce: CustomPokemonCombinationWithProduce[] = [defaultJolteon];

    const reverseIndex = createPokemonByIngredientReverseIndex(defaultProduce);
    const memoizedSetCover: SetCover = new SetCover(reverseIndex, new Map());

    const defaultProduceMap = createProduceMap(defaultProduce);
    const currentPokemon = supportJolteon;

    const recipe: Recipe = {
      name: 'mock recipe',
      nrOfIngredients: 0,
      type: 'dessert',
      value: 0,
      valueMax: 0,
      bonus: 0,
      ingredients: [{ amount: 12, ingredient: ingredient.MOOMOO_MILK }],
    };

    const { teamSizeRequired, supportedUsedIngredients, supportedFillerIngredients } =
      calculateTeamSizeAndSupportedIngredients({
        recipe,
        currentPokemonDefault: defaultJolteon,
        currentPokemon,
        memoizedSetCover,
        timeout: 1000,
        defaultProduceMap,
      });

    expect(teamSizeRequired).toEqual(1);
    expect(prettifyIngredientDrop(supportedUsedIngredients)).toMatchInlineSnapshot(`"2 Milk"`);
    expect(prettifyIngredientDrop(supportedFillerIngredients)).toMatchInlineSnapshot(`"1 Cacao"`);
  });
});

describe('summarizeTeamProducedIngredientSources', () => {
  it("shall calculate a team's skill value contributions", () => {
    const raikou = generateProducingPokemon({
      pokemon: pokemon.RAIKOU,
      skillProcs: 5.3,
      average: [
        {
          amount: 0.3,
          ingredient: ingredient.FIERY_HERB,
        },
      ],
      produced: [
        {
          amount: 6.9,
          ingredient: ingredient.FIERY_HERB,
        },
      ],
    });

    const dragonite = generateProducingPokemon({
      pokemon: pokemon.DRAGONITE,
      skillProcs: 0,
      average: [
        {
          amount: 1.4,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 0.7,
          ingredient: ingredient.GREENGRASS_CORN,
        },
      ],
      produced: [
        {
          amount: 35.8,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 15.9,
          ingredient: ingredient.GREENGRASS_CORN,
        },
      ],
    });

    const tyranitar = generateProducingPokemon({
      pokemon: pokemon.TYRANITAR,
      skillProcs: 0,
      average: [
        {
          amount: 1.1,
          ingredient: ingredient.WARMING_GINGER,
        },
        {
          amount: 1.3,
          ingredient: ingredient.BEAN_SAUSAGE,
        },
      ],
      produced: [
        {
          amount: 27.1,
          ingredient: ingredient.WARMING_GINGER,
        },
        {
          amount: 30.9,
          ingredient: ingredient.BEAN_SAUSAGE,
        },
      ],
    });

    const defaultProduce = [raikou, dragonite, tyranitar];
    const recipe = curry.INFERNO_CORN_KEEMA_CURRY;

    const reverseIndex = createPokemonByIngredientReverseIndex(defaultProduce);
    const memoizedSetCover: SetCover = new SetCover(reverseIndex, new Map());

    const defaultProduceMap = createProduceMap(defaultProduce);
    const currentPokemon = raikou;

    const teams = memoizedSetCover.findOptimalCombinationFor(recipe.ingredients, [currentPokemon], 5, 1000);
    expect(teams).toHaveLength(1);
    const team = teams[0]!.team;
    const teamIngredientInfo = summarizeTeamProducedIngredientSources({
      currentPokemonDefault: currentPokemon,
      team,
      recipe,
      defaultProduceMap,
    });

    const result = teamIngredientInfo.map((ing) => ({
      ingredient: ing.ingredient.name,
      defaultAmount: MathUtils.round(ing.defaultAmount, 2),
      fromSupport: MathUtils.round(ing.fromSupport, 2),
      recipeAmount: MathUtils.round(ing.recipeAmount, 2),
      selfSupportAmount: MathUtils.round(ing.selfSupportAmount, 2),
    }));

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "defaultAmount": 42.7,
          "fromSupport": 12.37,
          "ingredient": "Herb",
          "recipeAmount": 27,
          "selfSupportAmount": 2.65,
        },
        {
          "defaultAmount": 15.9,
          "fromSupport": 6.18,
          "ingredient": "Corn",
          "recipeAmount": 14,
          "selfSupportAmount": 0,
        },
        {
          "defaultAmount": 27.1,
          "fromSupport": 9.72,
          "ingredient": "Ginger",
          "recipeAmount": 12,
          "selfSupportAmount": 0,
        },
        {
          "defaultAmount": 30.9,
          "fromSupport": 11.48,
          "ingredient": "Sausage",
          "recipeAmount": 24,
          "selfSupportAmount": 0,
        },
      ]
    `);
  });
});

function generateProducingPokemon(params: {
  pokemon: pokemon.Pokemon;
  produced: IngredientSet[];
  average: IngredientSet[];
  skillProcs?: number;
}): CustomPokemonCombinationWithProduce {
  const { pokemon, produced, average, skillProcs = 0 } = params;

  return {
    pokemonCombination: {
      pokemon,
      ingredientList: [], // not used
    },
    averageProduce: {
      berries: emptyBerrySet(pokemon.berry),
      ingredients: average,
    },
    // not used
    customStats: {
      level: 60,
      nature: nature.QUIET,
      skillLevel: pokemon.skill.maxLevel,
      subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S],
      inventoryLimit: maxCarrySize(pokemon),
    },
    detailedProduce: {
      produce: {
        berries: emptyBerrySet(pokemon.berry),
        ingredients: produced,
      },
      averageTotalSkillProcs: skillProcs,
      dayHelps: 0,
      nightHelps: 0,
      nightHelpsBeforeSS: 0,
      skillActivations: [],
      sneakySnack: emptyBerrySet(pokemon.berry),
      spilledIngredients: [],
    },
  };
}
