import { Berry } from '../../domain/berry';

export function berryPowerForLevel(berry: Berry, level: number): number {
  const linearGrowth = berry.value + (level - 1);
  const exponentialGrowth = berry.value * Math.pow(1.025, level - 1);

  return Math.round(Math.max(linearGrowth, exponentialGrowth));
}
