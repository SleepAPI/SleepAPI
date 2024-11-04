import { PokemonProduce } from '@src/domain/combination/produce';
import {
  SkillActivation,
  berry,
  emptyBerryInventory,
  emptyIngredientInventory,
  ingredient,
  mainskill,
  pokemon,
} from 'sleepapi-common';
import {
  activateDisguiseBerryBurst,
  activateEnergizingCheer,
  activateExtraHelpful,
  activateHelperBoost,
  activateIngredientMagnet,
  activateMetronome,
  activateNonProduceSkills,
  createSkillEvent,
} from './skill-activation';

describe('createSkillEvent', () => {
  it('shall create an Energizing Cheer skill event', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.ENERGIZING_CHEER_S,
      skillLevel: 6,
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.7,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 0,
      avgCritChancePerProc: 1,
    };
    createSkillEvent(params, 2);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toBe(mainskill.ENERGIZING_CHEER_S);
    expect(skillActivations[0].adjustedAmount).toBe((mainskill.ENERGIZING_CHEER_S.amount(6) * 0.7) / (5 * 2));
  });

  it('shall create an Ingredient Magnet skill event', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.INGREDIENT_MAGNET_S,
      skillLevel: 6,
      nrOfHelpsToActivate: 2,
      adjustedAmount: 0.5,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 0,
      avgCritChancePerProc: 1,
    };
    createSkillEvent(params, 1);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toBe(mainskill.INGREDIENT_MAGNET_S);
    expect(skillActivations[0].adjustedAmount).toBe((mainskill.INGREDIENT_MAGNET_S.amount(6) * 0.5) / 1);
  });

  it('shall create an Extra Helpful skill event', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.EXTRA_HELPFUL_S,
      skillLevel: 6,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 0.8,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 0,
      avgCritChancePerProc: 1,
    };
    createSkillEvent(params, 3);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toBe(mainskill.EXTRA_HELPFUL_S);
  });

  it('shall create a Helper Boost skill event', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.HELPER_BOOST,
      skillLevel: 6,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 0.5,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 1,
      avgCritChancePerProc: 1,
    };
    createSkillEvent(params);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toBe(mainskill.HELPER_BOOST);
  });

  it('shall create empty helper boost produce skill events if unique mons in team is zero', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.HELPER_BOOST,
      skillLevel: 6,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 0.5,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 0,
      avgCritChancePerProc: 1,
    };
    createSkillEvent(params);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].adjustedProduce?.ingredients.reduce((sum, cur) => sum + cur.amount, 0)).toBe(0);
  });

  it('shall handle Metronome skill activation differently', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.METRONOME,
      skillLevel: 6,
      nrOfHelpsToActivate: 5,
      adjustedAmount: 1,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 1,
      avgCritChancePerProc: 1,
    };
    createSkillEvent(params, 10);
    expect(skillActivations.length).toBe(mainskill.METRONOME_FACTOR);
  });

  it('shall default to non-produce skills activation for non-productive/non-random skills', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.CHARGE_STRENGTH_M,
      skillLevel: 6,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 0.9,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 0,
      avgCritChancePerProc: 1,
    };
    createSkillEvent(params, 4);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toEqual(mainskill.CHARGE_STRENGTH_M);
  });
});

describe('activateNonProduceSkills', () => {
  it('shall correctly apply adjusted amount for energy skill', () => {
    const params = {
      skill: mainskill.ENERGIZING_CHEER_S,
      skillLevel: 6,
      nrOfHelpsToActivate: 5,
      adjustedAmount: 0.5,
      metronomeFactor: 1,
    };
    const result = activateNonProduceSkills(params);
    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      adjustedAmount: 25,
      nrOfHelpsToActivate: 5,
      fractionOfProc: 0.5,
    });
  });

  it('shall adjust skill amount based on metronome factor for INGREDIENT_MAGNET skill', () => {
    const params = {
      skill: mainskill.INGREDIENT_MAGNET_S,
      skillLevel: 6,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 1,
      metronomeFactor: mainskill.METRONOME_FACTOR,
    };
    const result = activateNonProduceSkills(params);
    const metronomeFactor = mainskill.METRONOME_FACTOR;
    expect(result).toEqual({
      skill: mainskill.INGREDIENT_MAGNET_S,
      adjustedAmount: mainskill.INGREDIENT_MAGNET_S.amount(6) / metronomeFactor,
      nrOfHelpsToActivate: 1,
      fractionOfProc: 1 / metronomeFactor,
    });
  });

  it('shall handle strength skill with specific range', () => {
    const params = {
      skill: mainskill.CHARGE_STRENGTH_S_RANGE,
      skillLevel: 6,
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.8,
      metronomeFactor: 1,
    };
    const expectedAdjustedAmount = (mainskill.CHARGE_STRENGTH_S_RANGE.amount(6) * 0.8) / 1;
    const result = activateNonProduceSkills(params);
    expect(result).toEqual({
      skill: mainskill.CHARGE_STRENGTH_S_RANGE,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 3,
      fractionOfProc: 0.8,
    });
  });

  it('shall apply no adjustment for zero-adjustment amount', () => {
    const params = {
      skill: mainskill.CHARGE_ENERGY_S,
      skillLevel: 6,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 0,
      metronomeFactor: 1,
    };
    const result = activateNonProduceSkills(params);
    expect(result).toEqual({
      skill: mainskill.CHARGE_ENERGY_S,
      adjustedAmount: 0,
      nrOfHelpsToActivate: 4,
      fractionOfProc: 0,
    });
  });

  it('shall process skills with non-standard units', () => {
    const params = {
      skill: mainskill.COOKING_POWER_UP_S,
      skillLevel: 6,
      nrOfHelpsToActivate: 2,
      adjustedAmount: 1,
      metronomeFactor: 1,
    };
    const result = activateNonProduceSkills(params);
    expect(result).toEqual({
      skill: mainskill.COOKING_POWER_UP_S,
      adjustedAmount: 27,
      nrOfHelpsToActivate: 2,
      fractionOfProc: 1,
    });
  });
});

describe('activateExtraHelpful', () => {
  it('shall correctly calculate extra helpful produce for a given pokemon', () => {
    const params = {
      pokemonSet,
      skillLevel: 6,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 1,
      metronomeFactor: 1,
    };
    const result = activateExtraHelpful(params);

    const expectedBerriesAmount = (10 * mainskill.EXTRA_HELPFUL_S.amount(6)) / 5;
    const expectedIngredientsAmount = [
      { ingredient: ingredient.BEAN_SAUSAGE, amount: (20 * mainskill.EXTRA_HELPFUL_S.amount(6)) / 5 },
    ];

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      adjustedAmount: mainskill.EXTRA_HELPFUL_S.amount(6) / 5,
      nrOfHelpsToActivate: 1,
      adjustedProduce: {
        berries: [{ berry: berry.BELUE, amount: expectedBerriesAmount, level: 60 }],
        ingredients: expectedIngredientsAmount,
      },
      fractionOfProc: 1,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const params = {
      pokemonSet: pokemonSet,
      skillLevel: 6,
      nrOfHelpsToActivate: 2,
      adjustedAmount: 0,
      metronomeFactor: 1,
    };
    const result = activateExtraHelpful(params);
    const expectedAdjustedAmount = 0;

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 2,
      adjustedProduce: {
        berries: [{ berry: berry.BELUE, amount: 0, level: 60 }],
        ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 0 }],
      },
      fractionOfProc: 0,
    });
  });

  it('shall process with high metronome factor', () => {
    const params = {
      pokemonSet,
      skillLevel: 6,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 1,
      metronomeFactor: 10,
    };
    const result = activateExtraHelpful(params);
    const metronomeAndRandomFactor = 5 * 10;
    const expectedBerriesAmount = (10 * mainskill.EXTRA_HELPFUL_S.amount(6) * 1) / metronomeAndRandomFactor;
    const expectedIngredientsAmount = [
      {
        ingredient: ingredient.BEAN_SAUSAGE,
        amount: (20 * mainskill.EXTRA_HELPFUL_S.amount(6) * 1) / metronomeAndRandomFactor,
      },
    ];

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      adjustedAmount: mainskill.EXTRA_HELPFUL_S.amount(6) / metronomeAndRandomFactor,
      nrOfHelpsToActivate: 4,
      adjustedProduce: {
        berries: [{ berry: berry.BELUE, amount: expectedBerriesAmount, level: 60 }],
        ingredients: expectedIngredientsAmount,
      },
      fractionOfProc: 1 / (metronomeAndRandomFactor / 5),
    });
  });
});

describe('activateHelperBoost', () => {
  it('shall correctly calculate helper boost produce for a given pokemon', () => {
    const params = {
      pokemonSet,
      skillLevel: 6,
      uniqueHelperBoost: 5,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 1,
      metronomeFactor: 1,
    };
    const result = activateHelperBoost(params);

    const expectedBerriesAmount = pokemonSet.produce.berries[0].amount * (mainskill.HELPER_BOOST.amount(6) + 6);
    const expectedIngredientsAmount = [
      {
        ingredient: ingredient.BEAN_SAUSAGE,
        amount: pokemonSet.produce.ingredients[0].amount * (mainskill.HELPER_BOOST.amount(6) + 6),
      },
    ];

    expect(result).toEqual({
      skill: mainskill.HELPER_BOOST,
      adjustedAmount: mainskill.HELPER_BOOST.amount(6) + 6,
      nrOfHelpsToActivate: 1,
      adjustedProduce: {
        berries: [{ berry: berry.BELUE, amount: expectedBerriesAmount, level: 60 }],
        ingredients: expectedIngredientsAmount,
      },
      fractionOfProc: 1,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const params = {
      pokemonSet,
      skillLevel: 6,
      uniqueHelperBoost: 5,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 0,
      metronomeFactor: 1,
    };
    const result = activateHelperBoost(params);

    expect(result).toEqual({
      skill: mainskill.HELPER_BOOST,
      adjustedAmount: 0,
      nrOfHelpsToActivate: 1,
      adjustedProduce: {
        berries: [{ berry: berry.BELUE, amount: 0, level: 60 }],
        ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 0 }],
      },
      fractionOfProc: 0,
    });
  });

  it('shall process with high metronome factor', () => {
    const params = {
      pokemonSet,
      skillLevel: 6,
      uniqueHelperBoost: 5,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 1,
      metronomeFactor: 15,
    };
    const result = activateHelperBoost(params);
    const metronomeFactor = 15;

    const expectedBerriesAmount =
      (pokemonSet.produce.berries[0].amount * (mainskill.HELPER_BOOST.amount(6) + 6)) / metronomeFactor;
    const expectedIngredientsAmount = [
      {
        ingredient: ingredient.BEAN_SAUSAGE,
        amount: (pokemonSet.produce.ingredients[0].amount * (mainskill.HELPER_BOOST.amount(6) + 6)) / metronomeFactor,
      },
    ];

    expect(result).toEqual({
      skill: mainskill.HELPER_BOOST,
      adjustedAmount: (mainskill.HELPER_BOOST.amount(6) + 6) / metronomeFactor,
      nrOfHelpsToActivate: 1,
      adjustedProduce: {
        berries: [{ berry: berry.BELUE, amount: expectedBerriesAmount, level: 60 }],
        ingredients: expectedIngredientsAmount,
      },
      fractionOfProc: 1 / metronomeFactor,
    });
  });
});

describe('activateIngredientMagnet', () => {
  it('shall correctly calculate ingredient amounts for a given berry set', () => {
    const berries = emptyBerryInventory();
    const params = {
      berries: berries,
      skillLevel: 6,
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.5,
      metronomeFactor: 2,
    };
    const result = activateIngredientMagnet(params);
    const metronomeFactor = 2;
    const expectedAmount =
      (mainskill.INGREDIENT_MAGNET_S.amount(6) * 0.5) / (ingredient.INGREDIENTS.length * metronomeFactor);
    const expectedIngredients = ingredient.INGREDIENTS.map((ing) => ({
      ingredient: ing,
      amount: expectedAmount,
    }));

    expect(result).toEqual({
      skill: mainskill.INGREDIENT_MAGNET_S,
      adjustedAmount: (mainskill.INGREDIENT_MAGNET_S.amount(6) * 0.5) / 2,
      nrOfHelpsToActivate: 3,
      adjustedProduce: {
        berries: berries,
        ingredients: expectedIngredients,
      },
      fractionOfProc: 0.5 / metronomeFactor,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const berries = emptyBerryInventory();
    const params = {
      berries: berries,
      skillLevel: 6,
      nrOfHelpsToActivate: 2,
      adjustedAmount: 0,
      metronomeFactor: 1,
    };
    const result = activateIngredientMagnet(params);
    const expectedIngredients = ingredient.INGREDIENTS.map((ing) => ({
      ingredient: ing,
      amount: 0,
    }));

    expect(result).toEqual({
      skill: mainskill.INGREDIENT_MAGNET_S,
      adjustedAmount: 0,
      nrOfHelpsToActivate: 2,
      adjustedProduce: {
        berries: berries,
        ingredients: expectedIngredients,
      },
      fractionOfProc: 0,
    });
  });

  it('shall apply adjustment with high metronome factor', () => {
    const berries = emptyBerryInventory();
    const params = {
      berries: berries,
      skillLevel: 6,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 1,
      metronomeFactor: 10,
    };
    const result = activateIngredientMagnet(params);
    const metronomeFactor = 10;
    const expectedAmount =
      (mainskill.INGREDIENT_MAGNET_S.amount(6) * 1) / (ingredient.INGREDIENTS.length * metronomeFactor);
    const expectedIngredients = ingredient.INGREDIENTS.map((ing) => ({
      ingredient: ing,
      amount: expectedAmount,
    }));

    expect(result).toEqual({
      skill: mainskill.INGREDIENT_MAGNET_S,
      adjustedAmount: mainskill.INGREDIENT_MAGNET_S.amount(6) / 10,
      nrOfHelpsToActivate: 4,
      adjustedProduce: {
        berries: berries,
        ingredients: expectedIngredients,
      },
      fractionOfProc: 1 / metronomeFactor,
    });
  });
});

describe('activateEnergizingCheer', () => {
  it('shall correctly calculate adjusted amount with given parameters', () => {
    const params = { skillLevel: 6, nrOfHelpsToActivate: 3, adjustedAmount: 0.6, metronomeFactor: 2 };
    const result = activateEnergizingCheer(params);
    const metronomeFactor = 2;
    const expectedAdjustedAmount = (mainskill.ENERGIZING_CHEER_S.amount(6) * 0.6) / (5 * metronomeFactor);

    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 3,
      fractionOfProc: 0.6 / metronomeFactor,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const params = { skillLevel: 6, nrOfHelpsToActivate: 5, adjustedAmount: 0, metronomeFactor: 1 };
    const result = activateEnergizingCheer(params);

    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      adjustedAmount: 0,
      nrOfHelpsToActivate: 5,
      fractionOfProc: 0,
    });
  });

  it('shall calculate adjusted amount with high metronome factor', () => {
    const params = { skillLevel: 6, nrOfHelpsToActivate: 2, adjustedAmount: 1, metronomeFactor: 8 };
    const result = activateEnergizingCheer(params);
    const metronomeFactor = 8;
    const expectedAdjustedAmount = (mainskill.ENERGIZING_CHEER_S.amount(6) * 1) / (5 * metronomeFactor);

    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 2,
      fractionOfProc: 1 / metronomeFactor,
    });
  });
});

describe('activateMetronome', () => {
  it('shall activate all skills except METRONOME', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skillLevel: 6,
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.6,
      pokemonSet,
      skillActivations,
      uniqueHelperBoost: 1,
      avgCritChancePerProc: 1,
    };
    activateMetronome(params);
    expect(skillActivations.length).toBe(mainskill.METRONOME_FACTOR);
    mainskill.METRONOME_SKILLS.forEach((skill) => {
      expect(skillActivations.some((sa) => sa.skill === skill)).toBe(true);
    });
  });

  it('shall use the correct metronomeFactor for each skill activation', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skillLevel: 6,
      nrOfHelpsToActivate: 2,
      adjustedAmount: 0.8,
      pokemonSet,
      skillActivations: skillActivations,
      avgCritChancePerProc: 1,
      uniqueHelperBoost: 1,
    };
    activateMetronome(params);
    expect(skillActivations).toMatchSnapshot();
  });

  it('shall not alter existing skill activations in the array', () => {
    const existingSkillActivation = {
      skill: mainskill.CHARGE_ENERGY_S,
      adjustedAmount: 50,
      skillLevel: 6,
      nrOfHelpsToActivate: 5,
      fractionOfProc: 0.5,
    };
    const skillActivations = [existingSkillActivation];
    const params = {
      skillLevel: 6,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 1,
      pokemonSet,
      skillActivations: skillActivations,
      avgCritChancePerProc: 1,
      uniqueHelperBoost: 1,
    };
    activateMetronome(params);
    expect(skillActivations[0]).toEqual(existingSkillActivation);
    expect(skillActivations.length).toBe(mainskill.METRONOME_FACTOR + 1);
  });
});

const pokemonSet: PokemonProduce = {
  pokemon: pokemon.PINSIR,
  produce: {
    berries: [{ berry: berry.BELUE, amount: 10, level: 60 }],
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 20 }],
  },
};

describe('activateDisguiseBerryBurst', () => {
  it('shall correctly calculate berry burst for given pokemon', () => {
    const params = {
      skillLevel: 6,
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.7,
      pokemonSet: pokemonSet,
      avgCritChancePerProc: 0,
      metronomeFactor: 1,
    };
    const result = activateDisguiseBerryBurst(params);

    expect(result).toEqual<SkillActivation>({
      skill: mainskill.DISGUISE_BERRY_BURST,
      adjustedAmount: (mainskill.DISGUISE_BERRY_BURST.amount(6) * 0.7) / 1,
      nrOfHelpsToActivate: 3,
      adjustedProduce: {
        berries: [
          {
            berry: pokemonSet.pokemon.berry,
            amount: mainskill.DISGUISE_BERRY_BURST.amount(6) * 0.7,
            level: 0,
          },
        ],
        ingredients: emptyIngredientInventory(),
      },
      fractionOfProc: 0.7,
      critChance: 0,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const params = {
      skillLevel: 6,
      nrOfHelpsToActivate: 2,
      adjustedAmount: 0,
      pokemonSet: pokemonSet,
      avgCritChancePerProc: 0,
      metronomeFactor: 1,
    };
    const result = activateDisguiseBerryBurst(params);

    expect(result).toEqual<SkillActivation>({
      skill: mainskill.DISGUISE_BERRY_BURST,
      adjustedAmount: 0,
      nrOfHelpsToActivate: 2,
      adjustedProduce: {
        berries: [
          {
            berry: pokemonSet.pokemon.berry,
            amount: 0,
            level: 0,
          },
        ],
        ingredients: emptyIngredientInventory(),
      },
      fractionOfProc: 0,
      critChance: 0,
    });
  });

  it('shall calculate adjusted amount with high metronome factor', () => {
    const params = {
      skillLevel: 6,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 1,
      pokemonSet,
      avgCritChancePerProc: 0,
      metronomeFactor: 5,
    };
    const result = activateDisguiseBerryBurst(params);
    const expectedAdjustedAmount = (mainskill.DISGUISE_BERRY_BURST.amount(6) * 1) / 5;

    expect(result).toEqual<SkillActivation>({
      skill: mainskill.DISGUISE_BERRY_BURST,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 4,
      adjustedProduce: {
        berries: [
          {
            berry: pokemonSet.pokemon.berry,
            amount: (mainskill.DISGUISE_BERRY_BURST.amount(6) * 1) / 5,
            level: 0,
          },
        ],
        ingredients: emptyIngredientInventory(),
      },
      fractionOfProc: 1 / 5,
      critChance: 0,
    });
  });
});
