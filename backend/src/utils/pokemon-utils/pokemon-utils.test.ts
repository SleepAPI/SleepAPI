import { getPokemonNames } from './pokemon-utils';

describe('getPokemonNames', () => {
  it('shall return all pokemon by default', () => {
    const params = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };
    expect(getPokemonNames(params)).toMatchSnapshot();
  });

  it('shall return all cyan pokemon', () => {
    const params = {
      cyan: true,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };
    expect(getPokemonNames(params)).toMatchInlineSnapshot(`
      [
        "CLEFABLE",
        "DODRIO",
        "FERALIGATR",
        "CLEFAIRY",
        "DODUO",
        "TOTODILE",
        "CROCONAW",
        "CLEFFA",
        "SWABLU",
        "BLASTOISE",
        "DELIBIRD",
        "SQUIRTLE",
        "WARTORTLE",
        "WIGGLYTUFF",
        "GOLDUCK",
        "SLOWBRO",
        "VAPOREON",
        "SLOWKING",
        "TOGEKISS",
        "SYLVEON",
        "JIGGLYPUFF",
        "PSYDUCK",
        "SLOWPOKE",
        "IGGLYBUFF",
        "TOGEPI",
        "TOGETIC",
      ]
    `);
  });

  it('shall return all taupe pokemon', () => {
    const params = {
      cyan: false,
      taupe: true,
      snowdrop: false,
      lapis: false,
    };
    expect(getPokemonNames(params)).toMatchInlineSnapshot(`
      [
        "ONIX",
        "MAROWAK",
        "TYPHLOSION",
        "CUBONE",
        "CYNDAQUIL",
        "QUILAVA",
        "GOLEM",
        "DUGTRIO",
        "PUPITAR",
        "CHARIZARD",
        "CHARMANDER",
        "CHARMELEON",
        "DIGLETT",
        "GEODUDE",
        "GRAVELER",
        "LARVITAR",
        "ARCANINE",
        "FLAREON",
        "SUDOWOODO",
        "GROWLITHE",
        "BONSLY",
      ]
    `);
  });

  it('shall return all snowdrop pokemon', () => {
    const params = {
      cyan: false,
      taupe: false,
      snowdrop: true,
      lapis: false,
    };
    expect(getPokemonNames(params)).toMatchInlineSnapshot(`
      [
        "RATICATE",
        "HOUNDOOM",
        "VIGOROTH",
        "SLAKING",
        "WALREIN",
        "RATTATA",
        "HOUNDOUR",
        "SLAKOTH",
        "SPHEAL",
        "SEALEO",
        "ABOMASNOW",
        "ABSOL",
        "DITTO",
        "TYRANITAR",
        "KANGASKHAN",
        "SNOVER",
        "PERSIAN",
        "UMBREON",
        "SABLEYE",
        "GLACEON",
        "MEOWTH",
        "EEVEE",
      ]
    `);
  });

  it('shall return all lapis pokemon', () => {
    const params = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: true,
    };
    expect(getPokemonNames(params)).toMatchInlineSnapshot(`
      [
        "PRIMEAPE",
        "MEGANIUM",
        "MANKEY",
        "CHIKORITA",
        "BAYLEEF",
        "VENUSAUR",
        "VICTREEBEL",
        "MR_MIME",
        "BULBASAUR",
        "IVYSAUR",
        "BELLSPROUT",
        "WEEPINBELL",
        "MIME_JR",
        "ESPEON",
        "WOBBUFFET",
        "LUCARIO",
        "LEAFEON",
        "WYNAUT",
        "RIOLU",
      ]
    `);
  });

  it('shall return all pokemon for multiple islands', () => {
    const allIslands = {
      cyan: true,
      taupe: true,
      snowdrop: true,
      lapis: true,
    };

    expect(getPokemonNames(allIslands)).toMatchSnapshot();
  });
});
