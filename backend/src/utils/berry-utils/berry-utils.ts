import { berry, island } from 'sleepapi-common';

export function getBerriesForFilter(islands: {
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
  powerplant: boolean;
}) {
  const { cyan, taupe, snowdrop, lapis, powerplant } = islands;

  const cyanBerries = cyan ? island.CYAN.berries : [];
  const taupeBerries = taupe ? island.TAUPE.berries : [];
  const snowdropBerries = snowdrop ? island.SNOWDROP.berries : [];
  const lapisBerries = lapis ? island.LAPIS.berries : [];
  const powerplantBerries = powerplant ? island.POWER_PLANT.berries : [];

  return cyan || taupe || snowdrop || lapis || powerplant
    ? [...cyanBerries, ...taupeBerries, ...snowdropBerries, ...lapisBerries, ...powerplantBerries]
    : berry.BERRIES;
}

export function getBerriesForIsland(island?: island.Island): berry.Berry[] {
  return island?.berries ?? berry.BERRIES;
}
