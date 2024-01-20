import { OptimalTeamSolution, PokemonCombination } from '@src/domain/combination/combination';
import { CustomStats } from '@src/domain/combination/custom';
import { BLASTOISE, PINSIR } from '@src/domain/pokemon/ingredient-pokemon';
import { LEPPA } from '@src/domain/produce/berry';
import { DetailedProduce } from '@src/domain/produce/produce';
import { RASH } from '@src/domain/stat/nature';
import { MemoizedFilters, SetCover } from './set-cover';

describe('processOptimalTeamSolutions', () => {
  const filters: MemoizedFilters = {
    limit50: false,
    pokemon: [PINSIR.name],
  };

  const setCover = new SetCover(new Map(), filters, new Map());

  it('shall sort teams in each solution and remove duplicates', () => {
    const pc1: PokemonCombination = {
      pokemon: PINSIR,
      ingredientList: [],
    };

    const pc2: PokemonCombination = {
      pokemon: BLASTOISE,
      ingredientList: [],
    };

    const customStats: CustomStats = {
      level: 60,
      nature: RASH,
      subskills: [],
    };

    const detailedProduce: DetailedProduce = {
      helpsAfterSS: 0,
      helpsBeforeSS: 0,
      produce: { berries: { amount: 0, berry: LEPPA }, ingredients: [] },
      sneakySnack: { amount: 0, berry: LEPPA },
      spilledIngredients: [],
    };

    const optimalTeamSolutions: OptimalTeamSolution[] = [
      {
        team: [
          { pokemonCombination: pc1, customStats, detailedProduce },
          { pokemonCombination: pc2, customStats, detailedProduce },
        ],
        surplus: {
          extra: [],
          relevant: [],
          total: [],
        },
      },
      {
        team: [
          { pokemonCombination: pc2, customStats, detailedProduce },
          { pokemonCombination: pc1, customStats, detailedProduce },
        ],
        surplus: {
          extra: [],
          relevant: [],
          total: [],
        },
      },
    ];

    const processedSolutions = setCover.processOptimalTeamSolutions(optimalTeamSolutions);

    expect(processedSolutions).toHaveLength(1);
    expect(processedSolutions).toEqual([optimalTeamSolutions[0]]);
  });
});
