import { ProduceFlat } from '../../api/production/produce';
import { BERRIES } from '../../domain/berry/berries';
import { INGREDIENTS } from '../../domain/ingredient/ingredients';

export function initFlatArray(length: number) {
  return Float32Array.from(Array(length).fill(0));
}

export function emptyIngredientInventoryFlat(): Float32Array {
  return initFlatArray(INGREDIENTS.length);
}

export function emptyBerryInventoryFlat(): Float32Array {
  return initFlatArray(BERRIES.length);
}

export function getEmptyInventoryFlat(): ProduceFlat {
  return {
    berries: emptyBerryInventoryFlat(),
    ingredients: emptyIngredientInventoryFlat()
  };
}

// TODO: test
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
