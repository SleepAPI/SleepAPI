import { BELUE } from '../domain/berry';
import { GENDER_UNKNOWN } from '../domain/gender';
import { CHARGE_STRENGTH_M } from '../domain/mainskill';
import { Pokemon } from '../domain/pokemon';
import { MOCK_INGREDIENT_SET } from './ingredient-set';

export const MOCK_POKEMON: Pokemon = {
  name: 'Mockemon',
  specialty: 'skill',
  frequency: 3600,
  ingredientPercentage: 0,
  skillPercentage: 0,
  berry: BELUE,
  genders: GENDER_UNKNOWN,
  carrySize: 0,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredient0: MOCK_INGREDIENT_SET,
  ingredient30: [MOCK_INGREDIENT_SET],
  ingredient60: [MOCK_INGREDIENT_SET],
  skill: CHARGE_STRENGTH_M,
};
