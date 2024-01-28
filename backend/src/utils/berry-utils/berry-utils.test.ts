import { berry, island } from 'sleepapi-common';
import { getBerriesForFilter, getBerriesForIsland } from './berry-utils';

describe('getBerriesForFilter', () => {
  it('shall default to all berries', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };
    expect(getBerriesForFilter(islands)).toEqual(berry.BERRIES);
  });

  it('shall return cyan berries for cyan filter', () => {
    const islands = {
      cyan: true,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };
    expect(getBerriesForFilter(islands)).toEqual(berry.CYAN_BERRIES);
  });

  it('shall return taupe berries for taupe filter', () => {
    const islands = {
      cyan: false,
      taupe: true,
      snowdrop: false,
      lapis: false,
    };
    expect(getBerriesForFilter(islands)).toEqual(berry.TAUPE_BERRIES);
  });

  it('shall return snowdrop berries for snowdrop filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: true,
      lapis: false,
    };
    expect(getBerriesForFilter(islands)).toEqual(berry.SNOWDROP_BERRIES);
  });

  it('shall return lapis berries for lapis filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: true,
    };
    expect(getBerriesForFilter(islands)).toEqual(berry.LAPIS_BERRIES);
  });

  it('shall return both cyan and taupe berries if both filters are passed', () => {
    const islands = {
      cyan: true,
      taupe: true,
      snowdrop: false,
      lapis: false,
    };
    expect(getBerriesForFilter(islands)).toEqual([...berry.CYAN_BERRIES, ...berry.TAUPE_BERRIES]);
  });
});

describe('getBerriesForIsland', () => {
  it('shall default to all berries', () => {
    expect(getBerriesForIsland()).toEqual(berry.BERRIES);
  });

  it('shall return cyan berries for cyan filter', () => {
    expect(getBerriesForIsland(island.CYAN)).toEqual(berry.CYAN_BERRIES);
  });

  it('shall return taupe berries for taupe filter', () => {
    expect(getBerriesForIsland(island.TAUPE)).toEqual(berry.TAUPE_BERRIES);
  });

  it('shall return snowdrop berries for snowdrop filter', () => {
    expect(getBerriesForIsland(island.SNOWDROP)).toEqual(berry.SNOWDROP_BERRIES);
  });

  it('shall return lapis berries for lapis filter', () => {
    expect(getBerriesForIsland(island.LAPIS)).toEqual(berry.LAPIS_BERRIES);
  });
});
