import { berry, island } from 'sleepapi-common';

export function getBerriesForFilter(islands: { cyan: boolean; taupe: boolean; snowdrop: boolean; lapis: boolean }) {
  const { cyan, taupe, snowdrop, lapis } = islands;

  const cyanBerries = cyan ? berry.CYAN_BERRIES : [];
  const taupeBerries = taupe ? berry.TAUPE_BERRIES : [];
  const snowdropBerries = snowdrop ? berry.SNOWDROP_BERRIES : [];
  const lapisBerries = lapis ? berry.LAPIS_BERRIES : [];

  return cyan || taupe || snowdrop || lapis
    ? [...cyanBerries, ...taupeBerries, ...snowdropBerries, ...lapisBerries]
    : berry.BERRIES;
}

export function getBerriesForIsland(island?: island.Island): berry.Berry[] {
  return island?.berries ?? berry.BERRIES;
}
