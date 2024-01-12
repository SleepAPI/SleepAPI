import { Island } from '../../domain/island/island';
import {
  BERRIES,
  Berry,
  CYAN_BERRIES,
  LAPIS_BERRIES,
  SNOWDROP_BERRIES,
  TAUPE_BERRIES,
} from '../../domain/produce/berry';

export function getBerriesForFilter(islands: { cyan: boolean; taupe: boolean; snowdrop: boolean; lapis: boolean }) {
  const { cyan, taupe, snowdrop, lapis } = islands;

  const cyanBerries = cyan ? CYAN_BERRIES : [];
  const taupeBerries = taupe ? TAUPE_BERRIES : [];
  const snowdropBerries = snowdrop ? SNOWDROP_BERRIES : [];
  const lapisBerries = lapis ? LAPIS_BERRIES : [];

  return cyan || taupe || snowdrop || lapis
    ? [...cyanBerries, ...taupeBerries, ...snowdropBerries, ...lapisBerries]
    : BERRIES;
}

export function getBerriesForIsland(island?: Island): Berry[] {
  return island?.berries ?? BERRIES;
}

export function getBerryNames(berries: Berry[]) {
  return berries.map((berry) => berry.name);
}
