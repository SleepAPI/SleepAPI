import type { ProduceFlat } from '../../api/production/produce';
import { BERRIES } from '../../domain/berry/berries';
import { INGREDIENTS } from '../../domain/ingredient/ingredients';

export function initFloatArray(length: number) {
  return Float32Array.from(Array(length).fill(0));
}
export function initIntArray(length: number) {
  return Int16Array.from(Array(length).fill(0));
}

export function emptyIngredientInventoryFloat(): Float32Array {
  return initFloatArray(INGREDIENTS.length);
}
export function emptyIngredientInventoryInt(): Int16Array {
  return initIntArray(INGREDIENTS.length);
}

export function emptyBerryInventoryFlat(): Float32Array {
  return initFloatArray(BERRIES.length);
}

export function getEmptyInventoryFloat(): ProduceFlat {
  return {
    berries: emptyBerryInventoryFlat(),
    ingredients: emptyIngredientInventoryFloat()
  };
}

// TEST
export function sumFlats(array1: Float32Array, array2: Float32Array) {
  const minLength = Math.min(array1.length, array2.length);
  const maxArray = array1.length > array2.length ? array1 : array2;
  let sum = 0;

  for (let i = 0; i < minLength; i++) {
    sum += array1[i] + array2[i];
  }

  for (let i = minLength; i < maxArray.length; i++) {
    sum += maxArray[i];
  }

  return sum;
}
