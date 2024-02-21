import { PokemonProduce } from '@src/domain/combination/produce';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { berry, ingredient, mainskill, pokemon } from 'sleepapi-common';
import { emptyBerrySet } from '../../berry/berry-calculator';
import {
  activateEnergizingCheer,
  activateExtraHelpful,
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
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.7,
      pokemonWithAverageProduce,
      skillActivations,
    };
    createSkillEvent(params, 2);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toBe(mainskill.ENERGIZING_CHEER_S);
    expect(skillActivations[0].adjustedAmount).toBe((mainskill.ENERGIZING_CHEER_S.amount * 0.7) / (5 * 2));
  });

  it('shall create an Ingredient Magnet skill event', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.INGREDIENT_MAGNET_S,
      nrOfHelpsToActivate: 2,
      adjustedAmount: 0.5,
      pokemonWithAverageProduce,
      skillActivations,
    };
    createSkillEvent(params, 1);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toBe(mainskill.INGREDIENT_MAGNET_S);
    expect(skillActivations[0].adjustedAmount).toBe((mainskill.INGREDIENT_MAGNET_S.amount * 0.5) / 1);
  });

  it('shall create an Extra Helpful skill event', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.EXTRA_HELPFUL_S,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 0.8,
      pokemonWithAverageProduce,
      skillActivations,
    };
    createSkillEvent(params, 3);
    expect(skillActivations.length).toBe(1);
    expect(skillActivations[0].skill).toBe(mainskill.EXTRA_HELPFUL_S);
  });

  it('shall handle Metronome skill activation differently', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.METRONOME,
      nrOfHelpsToActivate: 5,
      adjustedAmount: 1,
      pokemonWithAverageProduce,
      skillActivations,
    };
    createSkillEvent(params, 10);
  });

  it('shall default to non-produce skills activation for non-productive/non-random skills', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      skill: mainskill.CHARGE_STRENGTH_M,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 0.9,
      pokemonWithAverageProduce,
      skillActivations,
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
      nrOfHelpsToActivate: 1,
      adjustedAmount: 1,
      metronomeFactor: mainskill.MAINSKILLS.length - 1,
    };
    const result = activateNonProduceSkills(params);
    expect(result).toEqual({
      skill: mainskill.INGREDIENT_MAGNET_S,
      adjustedAmount: mainskill.INGREDIENT_MAGNET_S.amount / (mainskill.MAINSKILLS.length - 1),
      nrOfHelpsToActivate: 1,
      fractionOfProc: 1,
    });
  });

  it('shall handle strength skill with specific range', () => {
    const params = {
      skill: mainskill.CHARGE_STRENGTH_S_RANGE,
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.8,
      metronomeFactor: 1,
    };
    const expectedAdjustedAmount = (mainskill.CHARGE_STRENGTH_S_RANGE.amount * 0.8) / 1;
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
      pokemonWithAverageProduce: pokemonWithAverageProduce,
      nrOfHelpsToActivate: 1,
      adjustedAmount: 1,
      metronomeFactor: 1,
    };
    const result = activateExtraHelpful(params);

    const expectedBerriesAmount = (10 * mainskill.EXTRA_HELPFUL_S.amount) / 5;
    const expectedIngredientsAmount = [
      { ingredient: ingredient.BEAN_SAUSAGE, amount: (20 * mainskill.EXTRA_HELPFUL_S.amount) / 5 },
    ];
    const expectedAdjustedAmount =
      expectedBerriesAmount + expectedIngredientsAmount.reduce((sum, item) => sum + item.amount, 0);

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 1,
      adjustedProduce: {
        berries: { berry: berry.BELUE, amount: expectedBerriesAmount },
        ingredients: expectedIngredientsAmount,
      },
      fractionOfProc: 1,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const params = {
      pokemonWithAverageProduce: pokemonWithAverageProduce,
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
        berries: { berry: berry.BELUE, amount: 0 },
        ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 0 }],
      },
      fractionOfProc: 0,
    });
  });

  it('shall process with high metronome factor', () => {
    const params = {
      pokemonWithAverageProduce,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 1,
      metronomeFactor: 10,
    };
    const result = activateExtraHelpful(params);
    const expectedBerriesAmount = (10 * mainskill.EXTRA_HELPFUL_S.amount * 1) / (5 * 10);
    const expectedIngredientsAmount = [
      { ingredient: ingredient.BEAN_SAUSAGE, amount: (20 * mainskill.EXTRA_HELPFUL_S.amount * 1) / (5 * 10) },
    ];
    const expectedAdjustedAmount =
      expectedBerriesAmount + expectedIngredientsAmount.reduce((sum, item) => sum + item.amount, 0);

    expect(result).toEqual({
      skill: mainskill.EXTRA_HELPFUL_S,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 4,
      adjustedProduce: {
        berries: { berry: berry.BELUE, amount: expectedBerriesAmount },
        ingredients: expectedIngredientsAmount,
      },
      fractionOfProc: 1,
    });
  });
});

describe('activateIngredientMagnet', () => {
  it('shall correctly calculate ingredient amounts for a given berry set', () => {
    const berries = emptyBerrySet(berry.BELUE);
    const params = {
      berries: berries,
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.5,
      metronomeFactor: 2,
    };
    const result = activateIngredientMagnet(params);
    const expectedAmount = (mainskill.INGREDIENT_MAGNET_S.amount * 0.5) / (ingredient.INGREDIENTS.length * 2);
    const expectedIngredients = ingredient.INGREDIENTS.map((ing) => ({
      ingredient: ing,
      amount: expectedAmount,
    }));

    expect(result).toEqual({
      skill: mainskill.INGREDIENT_MAGNET_S,
      adjustedAmount: (mainskill.INGREDIENT_MAGNET_S.amount * 0.5) / 2,
      nrOfHelpsToActivate: 3,
      adjustedProduce: {
        berries: berries,
        ingredients: expectedIngredients,
      },
      fractionOfProc: 0.5,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const berries = emptyBerrySet(berry.BELUE);
    const params = {
      berries: berries,
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
    const berries = emptyBerrySet(berry.BELUE);
    const params = {
      berries: berries,
      nrOfHelpsToActivate: 4,
      adjustedAmount: 1,
      metronomeFactor: 10,
    };
    const result = activateIngredientMagnet(params);
    const expectedAmount = (mainskill.INGREDIENT_MAGNET_S.amount * 1) / (ingredient.INGREDIENTS.length * 10);
    const expectedIngredients = ingredient.INGREDIENTS.map((ing) => ({
      ingredient: ing,
      amount: expectedAmount,
    }));

    expect(result).toEqual({
      skill: mainskill.INGREDIENT_MAGNET_S,
      adjustedAmount: mainskill.INGREDIENT_MAGNET_S.amount / 10,
      nrOfHelpsToActivate: 4,
      adjustedProduce: {
        berries: berries,
        ingredients: expectedIngredients,
      },
      fractionOfProc: 1,
    });
  });
});

describe('activateEnergizingCheer', () => {
  it('shall correctly calculate adjusted amount with given parameters', () => {
    const params = {
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.6,
      metronomeFactor: 2,
    };
    const result = activateEnergizingCheer(params);
    const expectedAdjustedAmount = (mainskill.ENERGIZING_CHEER_S.amount * 0.6) / (5 * 2);

    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 3,
      fractionOfProc: 0.6,
    });
  });

  it('shall handle zero adjusted amount', () => {
    const params = {
      nrOfHelpsToActivate: 5,
      adjustedAmount: 0,
      metronomeFactor: 1,
    };
    const result = activateEnergizingCheer(params);

    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      adjustedAmount: 0,
      nrOfHelpsToActivate: 5,
      fractionOfProc: 0,
    });
  });

  it('shall calculate adjusted amount with high metronome factor', () => {
    const params = {
      nrOfHelpsToActivate: 2,
      adjustedAmount: 1,
      metronomeFactor: 8,
    };
    const result = activateEnergizingCheer(params);
    const expectedAdjustedAmount = (mainskill.ENERGIZING_CHEER_S.amount * 1) / (5 * 8);

    expect(result).toEqual({
      skill: mainskill.ENERGIZING_CHEER_S,
      adjustedAmount: expectedAdjustedAmount,
      nrOfHelpsToActivate: 2,
      fractionOfProc: 1,
    });
  });
});

describe('activateMetronome', () => {
  it('shall activate all skills except METRONOME', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      nrOfHelpsToActivate: 3,
      adjustedAmount: 0.6,
      pokemonWithAverageProduce,
      skillActivations: skillActivations,
    };
    activateMetronome(params);
    expect(skillActivations.length).toBe(mainskill.MAINSKILLS.length - 1);
    mainskill.MAINSKILLS.forEach((skill) => {
      if (skill !== mainskill.METRONOME) {
        expect(skillActivations.some((sa) => sa.skill === skill)).toBe(true);
      }
    });
  });

  it('shall use the correct metronomeFactor for each skill activation', () => {
    const skillActivations: SkillActivation[] = [];
    const params = {
      nrOfHelpsToActivate: 2,
      adjustedAmount: 0.8,
      pokemonWithAverageProduce,
      skillActivations: skillActivations,
    };
    activateMetronome(params);
    expect(skillActivations).toMatchSnapshot();
  });

  it('shall not alter existing skill activations in the array', () => {
    const existingSkillActivation = {
      skill: mainskill.CHARGE_ENERGY_S,
      adjustedAmount: 50,
      nrOfHelpsToActivate: 5,
      fractionOfProc: 0.5,
    };
    const skillActivations = [existingSkillActivation];
    const params = {
      nrOfHelpsToActivate: 4,
      adjustedAmount: 1,
      pokemonWithAverageProduce,
      skillActivations: skillActivations,
    };
    activateMetronome(params);
    expect(skillActivations[0]).toEqual(existingSkillActivation);
    expect(skillActivations.length).toBe(1 + mainskill.MAINSKILLS.length - 1);
  });
});

const pokemonWithAverageProduce: PokemonProduce = {
  pokemon: pokemon.PINSIR,
  produce: {
    berries: { berry: berry.BELUE, amount: 10 },
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 20 }],
  },
};
