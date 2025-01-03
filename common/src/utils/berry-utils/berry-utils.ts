import { BERRIES, TOTAL_NUMBER_OF_BERRIES } from '../../domain/berry/berries';
import type { Berry, BerrySet } from '../../domain/berry/berry';
import { MathUtils } from '../math-utils/math-utils';

export const BERRY_ID_LOOKUP: Record<string, number> = Object.fromEntries(
  BERRIES.map((berry, index) => [berry.name, index])
);

export function flatToBerrySet(berries: Float32Array, level: number): BerrySet[] {
  const result: BerrySet[] = emptyBerryInventory();
  for (let i = 0, len = berries.length; i < len; ++i) {
    const amount = berries[i];
    if (amount > 0) {
      result[result.length] = { berry: BERRIES[i], amount, level };
    }
  }
  return result;
}

export function berrySetToFlat(berrySet: BerrySet[]): Float32Array {
  const result = new Float32Array(TOTAL_NUMBER_OF_BERRIES);

  for (const { berry, amount } of berrySet) {
    const index = BERRY_ID_LOOKUP[berry.name];
    result[index] += amount;
  }

  return result;
}

export function berryPowerForLevel(berry: Berry, level: number): number {
  const linearGrowth = berry.value + (level - 1);
  const exponentialGrowth = berry.value * Math.pow(1.025, level - 1);

  return Math.round(Math.max(linearGrowth, exponentialGrowth));
}

// TODO: remove in Sleep api 2?
export function multiplyBerries(berries: BerrySet[], multiplyAmount: number): BerrySet[] {
  return berries.map(({ amount, berry, level }) => ({ amount: amount * multiplyAmount, berry, level }));
}

// TODO: remove in Sleep api 2?
export function roundBerries(berries: BerrySet[], precision: number): BerrySet[] {
  return berries.map(({ amount, berry, level }) => ({ amount: MathUtils.round(amount, precision), berry, level }));
}

// TODO: remove in Sleep api 2?
export function emptyBerryInventory(): BerrySet[] {
  return [];
}

// TODO: remove in Sleep api 2?
export function prettifyBerries(berries: BerrySet[], separator = ', '): string {
  return berries.map(({ amount, berry }) => `${MathUtils.round(amount, 1)} ${berry.name}`).join(separator);
}
