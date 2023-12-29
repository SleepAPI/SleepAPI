import { BERRIES, Berry, CYAN_BERRIES, SNOWDROP_BERRIES, TAUPE_BERRIES } from '../../domain/produce/berry';

export function getBerriesForFilter(islands: { cyan: boolean; taupe: boolean; snowdrop: boolean }) {
  const { cyan, taupe, snowdrop } = islands;

  const cyanBerries = cyan ? CYAN_BERRIES : [];
  const taupeBerries = taupe ? TAUPE_BERRIES : [];
  const snowdropBerries = snowdrop ? SNOWDROP_BERRIES : [];

  return cyan || taupe || snowdrop ? [...cyanBerries, ...taupeBerries, ...snowdropBerries] : BERRIES;
}

export function getBerryNames(berries: Berry[]) {
  return berries.map((berry) => berry.name);
}
