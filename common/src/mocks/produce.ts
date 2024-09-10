import { Produce } from '../api';
import { MOCK_BERRY_SET } from './berry-drop';
import { MOCK_INGREDIENT_SET } from './ingredient-set';

export const MOCK_PRODUCE: Produce = {
  berries: MOCK_BERRY_SET,
  ingredients: [MOCK_INGREDIENT_SET],
};
