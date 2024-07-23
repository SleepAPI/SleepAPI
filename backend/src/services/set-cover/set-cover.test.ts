import { OptimalTeamSolution } from '@src/domain/combination/combination';
import { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom';
import { DetailedProduce } from '@src/domain/combination/produce';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { createPokemonByIngredientReverseIndex } from '@src/utils/set-cover-utils/set-cover-utils';
import {
  PokemonIngredientSet,
  berry,
  dessert,
  ingredient,
  maxCarrySize,
  nature,
  pokemon,
  prettifyIngredientDrop,
  subskill,
} from 'sleepapi-common';
import { emptyBerrySet } from '../calculator/berry/berry-calculator';
import { addIngredientSet } from '../calculator/ingredient/ingredient-calculate';
import { SetCover } from './set-cover';

describe('processOptimalTeamSolutions', () => {
  const setCover = new SetCover(new Map(), new Map());

  it('shall sort teams in each solution and remove duplicates', () => {
    const pc1: PokemonIngredientSet = {
      pokemon: pokemon.PINSIR,
      ingredientList: [],
    };

    const pc2: PokemonIngredientSet = {
      pokemon: pokemon.BLASTOISE,
      ingredientList: [],
    };

    const customStats: CustomStats = {
      level: 60,
      nature: nature.RASH,
      subskills: [],
      skillLevel: 6,
      inventoryLimit: maxCarrySize(pokemon.PINSIR),
    };

    const detailedProduce: DetailedProduce = {
      produce: { berries: { amount: 0, berry: berry.LEPPA }, ingredients: [] },
      sneakySnack: { amount: 0, berry: berry.LEPPA },
      spilledIngredients: [],
      dayHelps: 0,
      nightHelps: 0,
      nightHelpsBeforeSS: 0,
      averageTotalSkillProcs: 0,
      skillActivations: [],
    };

    const optimalTeamSolutions: OptimalTeamSolution[] = [
      {
        team: [
          { pokemonCombination: pc1, customStats, detailedProduce, averageProduce: InventoryUtils.getEmptyInventory() },
          { pokemonCombination: pc2, customStats, detailedProduce, averageProduce: InventoryUtils.getEmptyInventory() },
        ],
        surplus: {
          extra: [],
          relevant: [],
          total: [],
        },
        exhaustive: true,
      },
      {
        team: [
          { pokemonCombination: pc2, customStats, detailedProduce, averageProduce: InventoryUtils.getEmptyInventory() },
          { pokemonCombination: pc1, customStats, detailedProduce, averageProduce: InventoryUtils.getEmptyInventory() },
        ],
        surplus: {
          extra: [],
          relevant: [],
          total: [],
        },
        exhaustive: true,
      },
    ];

    const processedSolutions = setCover.processOptimalTeamSolutions(optimalTeamSolutions);

    expect(processedSolutions).toHaveLength(1);
    expect(processedSolutions).toEqual([optimalTeamSolutions[0]]);
  });
});

describe('findOptimalCombinationFor', () => {
  it('shall respect timeout and return exhaustive false', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [raikou];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);

    const setCover = new SetCover(reverseIndex, new Map());
    // raikou should solo this recipe, but we should timeout before
    const result = setCover.findOptimalCombinationFor([{ amount: 1, ingredient: ingredient.FANCY_APPLE }], [], 5, 0);

    expect(result).toHaveLength(0);
  });

  it('shall return empty array if no solutions found', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [raikou];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);

    const setCover = new SetCover(reverseIndex, new Map());
    const result = setCover.findOptimalCombinationFor([{ amount: 100, ingredient: ingredient.GREENGRASS_CORN }]);

    expect(result).toHaveLength(0);
  });

  it('shall not add special pokemon twice', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [raikou];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);
    expect(reverseIndex.size).toBe(16);

    const setCover = new SetCover(reverseIndex, new Map());
    // set recipe to 2x raikou's produced ingredients, meaning raikou will need help to make this recipe, or be included twice (not allowed)
    const result = setCover.findOptimalCombinationFor(
      addIngredientSet(raikou.detailedProduce.produce.ingredients, raikou.detailedProduce.produce.ingredients)
    );

    expect(result).toHaveLength(0);
  });

  // test using same cache to make recipe with raikou and raichu which boosts raichu apple from 3 to 4.4, then make recipe that needs 3 apple with same cache and see that result is raichu 3 apples and not raichu 4.4 apples. Result for 2nd recipe should not be raikou-boosted
  it('cached raikou solutions shall not affect solutions without raikou', () => {
    const cache = new Map();

    const produce: CustomPokemonCombinationWithProduce[] = [raichu, raikou];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);

    const setCover = new SetCover(reverseIndex, cache);
    const firstRecipeSolve = setCover.findOptimalCombinationFor(dessert.NEROLIS_RESTORATIVE_TEA.ingredients);

    expect(firstRecipeSolve).toHaveLength(1);
    const team = firstRecipeSolve[0].team!;
    expect(team).toHaveLength(2); // raichu and raikou
    const updatedRaichu = team[0];

    expect(prettifyIngredientDrop(updatedRaichu.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"4.2 Apple, 18 Ginger"`
    );

    const secondRecipeSolve = setCover.findOptimalCombinationFor([{ amount: 3, ingredient: ingredient.FANCY_APPLE }]);
    expect(secondRecipeSolve).toHaveLength(2);

    const [firstTeamSolution, secondTeamSolution] = secondRecipeSolve;

    expect(firstTeamSolution.team).toHaveLength(1);
    const raikouTeam = firstTeamSolution.team[0]!;
    expect(prettifyIngredientDrop(raikouTeam.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"4 Cacao, 19 Apple, 17 Mushroom"`
    );

    expect(secondTeamSolution.team).toHaveLength(1);
    const raichuTeam = secondTeamSolution.team[0]!;
    expect(prettifyIngredientDrop(raichuTeam.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"3 Apple, 15 Ginger"`
    );
  });

  it('for team [RAICHU, RAIKOU] shall add 6 helps to both when RAIKOU gets added', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [raichu, raikou];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);
    expect(reverseIndex.size).toBe(16);
    expect(
      reverseIndex
        .get(ingredient.FANCY_APPLE.name)
        ?.map(
          (pk) =>
            `${pk.pokemonCombination.pokemon.name} (${prettifyIngredientDrop(pk.pokemonCombination.ingredientList)})`
        )
    ).toMatchInlineSnapshot(`
      [
        "RAIKOU (2 Cacao, 8 Apple, 7 Mushroom)",
        "RAICHU (1 Apple, 2 Ginger, 3 Ginger)",
      ]
    `);
    const setCover = new SetCover(reverseIndex, new Map());
    const result = setCover.findOptimalCombinationFor(dessert.NEROLIS_RESTORATIVE_TEA.ingredients);

    expect(result).toHaveLength(1);
    const team = result[0].team!;
    expect(team).toHaveLength(2); // raichu and raikou
    const updatedRaichu = team[0];
    const updatedRaikou = team[1];

    const helps = 6;

    expect(updatedRaichu.detailedProduce.produce.berries?.amount).toBe(
      helps * updatedRaichu.averageProduce.berries!.amount
    );
    expect(prettifyIngredientDrop(updatedRaichu.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"4.2 Apple, 18 Ginger"`
    );
    expect(prettifyIngredientDrop(updatedRaikou.detailedProduce.produce.ingredients)).toBe(
      '4.2 Cacao, 20 Apple, 18 Mushroom'
    );
  });

  it('raikou shall scale properly with team size 3, with only 2 unique electric', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [raichu, raikou];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);

    const setCover = new SetCover(reverseIndex, new Map());
    const result = setCover.findOptimalCombinationFor([{ ingredient: ingredient.FANCY_APPLE, amount: 21 + 8 }]);

    expect(result).toHaveLength(1);
    const team = result[0].team!;
    expect(team).toHaveLength(3); // raikou, 2x raichu
    const firstMember = team[0];
    const secondMember = team[1];
    const thirdMember = team[2];

    expect(prettifyIngredientDrop(firstMember.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"4.2 Apple, 18 Ginger"`
    );
    expect(prettifyIngredientDrop(secondMember.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"4.2 Apple, 18 Ginger"`
    );
    expect(prettifyIngredientDrop(thirdMember.detailedProduce.produce.ingredients)).toBe(
      '4.2 Cacao, 20 Apple, 18 Mushroom'
    );
  });

  it('raikou shall scale properly with team size 3, with 3 unique electric', () => {
    const pikachu: CustomPokemonCombinationWithProduce = {
      ...raichu,
      pokemonCombination: {
        ...raichu.pokemonCombination,
        pokemon: {
          ...raichu.pokemonCombination.pokemon,
          name: 'PIKACHU',
        },
      },
    };
    const produce: CustomPokemonCombinationWithProduce[] = [raikou, raichu, pikachu];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);

    const setCover = new SetCover(reverseIndex, new Map());
    const result = setCover.findOptimalCombinationFor([{ ingredient: ingredient.FANCY_APPLE, amount: 21 + 8 }]);

    expect(result).toHaveLength(3);
    const team = result[0].team!;
    expect(team).toHaveLength(3); // raikou, raichu, pikachu
    const firstMember = team[0];
    const secondMember = team[1];
    const thirdMember = team[2];

    expect(prettifyIngredientDrop(firstMember.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"4.6 Apple, 19 Ginger"`
    );
    expect(prettifyIngredientDrop(secondMember.detailedProduce.produce.ingredients)).toMatchInlineSnapshot(
      `"4.6 Apple, 19 Ginger"`
    );
    expect(prettifyIngredientDrop(thirdMember.detailedProduce.produce.ingredients)).toBe(
      '4.6 Cacao, 22 Apple, 20 Mushroom'
    );
  });

  it('cache shall support ingredient magnet', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [vaporeon];
    const reverseIndex = createPokemonByIngredientReverseIndex(produce);

    const setCover = new SetCover(reverseIndex, new Map());
    const result = setCover.findOptimalCombinationFor([
      { ingredient: ingredient.MOOMOO_MILK, amount: 9 },
      { ingredient: ingredient.FANCY_APPLE, amount: 1 },
    ]);

    expect(result).toHaveLength(1);
    const team = result[0].team!;
    expect(team).toHaveLength(1); // vaporeon
    const vaporeonProduce = team[0]!.detailedProduce.produce.ingredients;

    expect(prettifyIngredientDrop(vaporeonProduce)).toMatchInlineSnapshot(
      `"9 Milk and 1.37 of all 15 other ingredients"`
    );
  });
});

const raichu: CustomPokemonCombinationWithProduce = {
  pokemonCombination: {
    pokemon: pokemon.RAICHU,
    ingredientList: [
      {
        amount: 1,
        ingredient: ingredient.FANCY_APPLE,
      },
      {
        amount: 2,
        ingredient: ingredient.WARMING_GINGER,
      },
      {
        amount: 3,
        ingredient: ingredient.WARMING_GINGER,
      },
    ],
  },
  averageProduce: {
    berries: {
      berry: berry.GREPA,
      amount: 0.6,
    },
    ingredients: [
      {
        amount: 0.2,
        ingredient: ingredient.FANCY_APPLE,
      },
      {
        amount: 0.5,
        ingredient: ingredient.WARMING_GINGER,
      },
    ],
  },
  customStats: {
    level: 60,
    nature: nature.QUIET,
    skillLevel: 6,
    subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S],
    inventoryLimit: maxCarrySize(pokemon.RAICHU),
  },
  detailedProduce: {
    produce: {
      berries: emptyBerrySet(pokemon.RAICHU.berry),
      ingredients: [
        {
          amount: 3,
          ingredient: ingredient.FANCY_APPLE,
        },
        {
          amount: 15,
          ingredient: ingredient.WARMING_GINGER,
        },
      ],
    },
    averageTotalSkillProcs: 0,
    dayHelps: 0,
    nightHelps: 0,
    nightHelpsBeforeSS: 0,
    skillActivations: [],
    sneakySnack: emptyBerrySet(pokemon.RAICHU.berry),
    spilledIngredients: [],
  },
};

const raikou: CustomPokemonCombinationWithProduce = {
  pokemonCombination: {
    pokemon: pokemon.RAIKOU,
    ingredientList: [
      {
        amount: 2,
        ingredient: ingredient.SOOTHING_CACAO,
      },
      {
        amount: 8,
        ingredient: ingredient.FANCY_APPLE,
      },
      {
        amount: 7,
        ingredient: ingredient.TASTY_MUSHROOM,
      },
    ],
  },
  averageProduce: {
    berries: {
      berry: berry.GREPA,
      amount: 0.6,
    },
    ingredients: [
      {
        amount: 0.2,
        ingredient: ingredient.SOOTHING_CACAO,
      },
      {
        amount: 1,
        ingredient: ingredient.FANCY_APPLE,
      },
      {
        amount: 1,
        ingredient: ingredient.TASTY_MUSHROOM,
      },
    ],
  },
  customStats: {
    level: 60,
    nature: nature.QUIET,
    skillLevel: 6,
    subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S],
    inventoryLimit: maxCarrySize(pokemon.RAIKOU),
  },
  detailedProduce: {
    produce: {
      berries: emptyBerrySet(pokemon.RAIKOU.berry),
      ingredients: [
        {
          amount: 3,
          ingredient: ingredient.SOOTHING_CACAO,
        },
        {
          amount: 14,
          ingredient: ingredient.FANCY_APPLE,
        },
        {
          amount: 12,
          ingredient: ingredient.TASTY_MUSHROOM,
        },
      ],
    },
    averageTotalSkillProcs: 3,
    dayHelps: 0,
    nightHelps: 0,
    nightHelpsBeforeSS: 0,
    skillActivations: [],
    sneakySnack: emptyBerrySet(pokemon.RAICHU.berry),
    spilledIngredients: [],
  },
};

const vaporeon: CustomPokemonCombinationWithProduce = {
  pokemonCombination: {
    pokemon: pokemon.VAPOREON,
    ingredientList: [
      {
        amount: 1,
        ingredient: ingredient.MOOMOO_MILK,
      },
      {
        amount: 2,
        ingredient: ingredient.MOOMOO_MILK,
      },
      {
        amount: 4,
        ingredient: ingredient.MOOMOO_MILK,
      },
    ],
  },
  averageProduce: InventoryUtils.getEmptyInventory(),
  customStats: {
    level: 60,
    nature: nature.QUIET,
    skillLevel: 6,
    subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S],
    inventoryLimit: maxCarrySize(pokemon.VAPOREON),
  },
  detailedProduce: {
    produce: {
      berries: emptyBerrySet(pokemon.VAPOREON.berry),
      ingredients: [
        {
          amount: 9,
          ingredient: ingredient.MOOMOO_MILK,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.FANCY_APPLE,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.GREENGRASS_SOYBEANS,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.HONEY,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.BEAN_SAUSAGE,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.WARMING_GINGER,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.SNOOZY_TOMATO,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.FANCY_EGG,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.PURE_OIL,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.SOFT_POTATO,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.FIERY_HERB,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.GREENGRASS_CORN,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.SOOTHING_CACAO,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.TASTY_MUSHROOM,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.LARGE_LEEK,
        },
        {
          amount: 1.3653423571121408,
          ingredient: ingredient.SLOWPOKE_TAIL,
        },
      ],
    },
    averageTotalSkillProcs: 10,
    dayHelps: 0,
    nightHelps: 0,
    nightHelpsBeforeSS: 0,
    skillActivations: [],
    sneakySnack: emptyBerrySet(pokemon.RAICHU.berry),
    spilledIngredients: [],
  },
};
