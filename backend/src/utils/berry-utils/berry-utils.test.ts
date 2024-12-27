import { getBerriesForFilter, getBerriesForIsland } from '@src/utils/berry-utils/berry-utils.js';
import { describe, expect, it } from 'bun:test';
import { berry, island } from 'sleepapi-common';

describe('getBerriesForFilter', () => {
  it('shall default to all berries', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: false
    };
    expect(getBerriesForFilter(islands)).toEqual(berry.BERRIES);
  });

  it('shall return cyan berries for cyan filter', () => {
    const islands = {
      cyan: true,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: false
    };
    expect(getBerriesForFilter(islands)).toEqual(island.CYAN.berries);
  });

  it('shall return taupe berries for taupe filter', () => {
    const islands = {
      cyan: false,
      taupe: true,
      snowdrop: false,
      lapis: false,
      powerplant: false
    };
    expect(getBerriesForFilter(islands)).toEqual(island.TAUPE.berries);
  });

  it('shall return snowdrop berries for snowdrop filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: true,
      lapis: false,
      powerplant: false
    };
    expect(getBerriesForFilter(islands)).toEqual(island.SNOWDROP.berries);
  });

  it('shall return lapis berries for lapis filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: true,
      powerplant: false
    };
    expect(getBerriesForFilter(islands)).toEqual(island.LAPIS.berries);
  });

  it('shall return power plant berries for powerplant filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: true
    };
    expect(getBerriesForFilter(islands)).toEqual(island.POWER_PLANT.berries);
  });

  it('shall return both cyan and taupe berries if both filters are passed', () => {
    const islands = {
      cyan: true,
      taupe: true,
      snowdrop: false,
      lapis: false,
      powerplant: false
    };
    expect(getBerriesForFilter(islands)).toEqual([...island.CYAN.berries, ...island.TAUPE.berries]);
  });
});

describe('getBerriesForIsland', () => {
  it('shall default to all berries', () => {
    expect(getBerriesForIsland()).toEqual(berry.BERRIES);
  });

  it('shall return cyan berries for cyan filter', () => {
    expect(getBerriesForIsland(island.CYAN)).toEqual(island.CYAN.berries);
  });

  it('shall return taupe berries for taupe filter', () => {
    expect(getBerriesForIsland(island.TAUPE)).toEqual(island.TAUPE.berries);
  });

  it('shall return snowdrop berries for snowdrop filter', () => {
    expect(getBerriesForIsland(island.SNOWDROP)).toEqual(island.SNOWDROP.berries);
  });

  it('shall return lapis berries for lapis filter', () => {
    expect(getBerriesForIsland(island.LAPIS)).toEqual(island.LAPIS.berries);
  });

  it('shall return power plant berries for power plant filter', () => {
    expect(getBerriesForIsland(island.POWER_PLANT)).toEqual(island.POWER_PLANT.berries);
  });
});
