import type { Berry } from '../../domain/berry';
import type { BerrySet } from '../../domain/types/berry-set';
import { MathUtils } from '../math-utils/math-utils';

export function berryPowerForLevel(berry: Berry, level: number): number {
  const linearGrowth = berry.value + (level - 1);
  const exponentialGrowth = berry.value * Math.pow(1.025, level - 1);

  return Math.round(Math.max(linearGrowth, exponentialGrowth));
}

export function multiplyBerries(berries: BerrySet[], multiplyAmount: number): BerrySet[] {
  return berries.map(({ amount, berry, level }) => ({ amount: amount * multiplyAmount, berry, level }));
}

export function roundBerries(berries: BerrySet[], precision: number): BerrySet[] {
  return berries.map(({ amount, berry, level }) => ({ amount: MathUtils.round(amount, precision), berry, level }));
}

export function emptyBerryInventory(): BerrySet[] {
  return [];
}

export function prettifyBerries(berries: BerrySet[], separator = ', '): string {
  return berries.map(({ amount, berry }) => `${MathUtils.round(amount, 1)} ${berry.name}`).join(separator);
}
