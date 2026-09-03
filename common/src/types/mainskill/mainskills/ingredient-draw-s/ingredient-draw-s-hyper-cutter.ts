import type { ActivationsType, AmountFunction, AmountParams, Ingredient } from '../../..';
import { rollToOutput } from '../../../../utils/mainskill-utils/mainskill-utils';
import { GREENGRASS_CORN, PURE_OIL, SNOOZY_TOMATO, SOFT_POTATO } from '../../../ingredient/ingredients';
import { ModifiedMainskill, ZeroAmount } from '../../mainskill';
import { IngredientDrawSSandshrew } from './ingredient-draw-s';

class IngredientDrawSHyperCutterImpl extends ModifiedMainskill {
  baseSkill = IngredientDrawSSandshrew; // any of the normal versions works
  modifierName = 'Hyper Cutter';
  RP = [880, 1251, 1726, 2383, 3290, 4846, 5843];
  ingredientAmounts = [5, 6, 8, 11, 13, 16, 18];
  critIngredientAmounts = this.ingredientAmounts.map((normalAmount) => normalAmount * 2);
  image = 'ingredient_draw';

  description = (params: AmountParams) =>
    `Gets ${this.ingredientAmounts[params.skillLevel - 1]} of one type of ingredient chosen randomly from a specific selection of ingredients. Sometimes gets an additional ${this.ingredientAmounts[params.skillLevel - 1]} ingredients.`;

  activations: ActivationsType = {
    ingredients: {
      unit: 'ingredients',
      amount: this.leveledAmount(this.ingredientAmounts),
      critAmount: this.leveledAmount(this.critIngredientAmounts)
    }
  };

  HyperCutterProbabilities: Record<HyperCutterOutput, number> = {
    Potato: 20.9,
    Oil: 20.9,
    Tomato: 20.9,
    Corn: 20.9,
    'Potato (L)': 4.1,
    'Oil (L)': 4.1,
    'Tomato (L)': 4.1,
    'Corn (L)': 4.1
  };

  HyperCutterResultConfig: Record<HyperCutterOutput, HyperCutterResult> = {
    Potato: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: SOFT_POTATO
    },
    Oil: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: PURE_OIL
    },
    Tomato: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: SNOOZY_TOMATO
    },
    Corn: {
      amountFunc: this.activations.ingredients.amount,
      critAmountFunc: ZeroAmount,
      ingredient: GREENGRASS_CORN
    },
    'Potato (L)': {
      amountFunc: ZeroAmount,
      critAmountFunc: this.activations.ingredients.critAmount!,
      ingredient: SOFT_POTATO
    },
    'Oil (L)': {
      amountFunc: ZeroAmount,
      critAmountFunc: this.activations.ingredients.critAmount!,
      ingredient: PURE_OIL
    },
    'Tomato (L)': {
      amountFunc: ZeroAmount,
      critAmountFunc: this.activations.ingredients.critAmount!,
      ingredient: SNOOZY_TOMATO
    },
    'Corn (L)': {
      amountFunc: ZeroAmount,
      critAmountFunc: this.activations.ingredients.critAmount!,
      ingredient: GREENGRASS_CORN
    }
  };

  rollToResult(roll: number): HyperCutterResult {
    return this.HyperCutterResultConfig[rollToOutput(roll, this.HyperCutterProbabilities)];
  }
}

export type HyperCutterOutput =
  | 'Potato'
  | 'Oil'
  | 'Tomato'
  | 'Corn'
  | 'Potato (L)'
  | 'Oil (L)'
  | 'Tomato (L)'
  | 'Corn (L)';

export interface HyperCutterResult {
  amountFunc: AmountFunction;
  critAmountFunc: AmountFunction;
  ingredient: Ingredient;
}

export const IngredientDrawSHyperCutter = new IngredientDrawSHyperCutterImpl();
