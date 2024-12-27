import { getPokemonNames } from '@src/utils/pokemon-utils/pokemon-utils.js';
import { describe, expect, it } from 'bun:test';

describe('getPokemonNames', () => {
  it('shall return all pokemon by default', () => {
    const params = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: false
    };
    expect(getPokemonNames(params)).toMatchSnapshot();
  });

  it('shall return all cyan pokemon', () => {
    const params = {
      cyan: true,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: false
    };
    expect(getPokemonNames(params)).toMatchSnapshot();
  });

  it('shall return all taupe pokemon', () => {
    const params = {
      cyan: false,
      taupe: true,
      snowdrop: false,
      lapis: false,
      powerplant: false
    };
    expect(getPokemonNames(params)).toMatchSnapshot();
  });

  it('shall return all snowdrop pokemon', () => {
    const params = {
      cyan: false,
      taupe: false,
      snowdrop: true,
      lapis: false,
      powerplant: false
    };
    expect(getPokemonNames(params)).toMatchSnapshot();
  });

  it('shall return all lapis pokemon', () => {
    const params = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: true,
      powerplant: false
    };
    expect(getPokemonNames(params)).toMatchSnapshot();
  });

  it('shall return all power plant pokemon', () => {
    const params = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: true
    };
    expect(getPokemonNames(params)).toMatchSnapshot();
  });

  it('shall return all pokemon for multiple islands', () => {
    const allIslands = {
      cyan: true,
      taupe: true,
      snowdrop: true,
      lapis: true,
      powerplant: true
    };

    expect(getPokemonNames(allIslands)).toMatchSnapshot();
  });
});
