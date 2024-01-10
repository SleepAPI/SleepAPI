import { CustomStats } from '../../../domain/combination/custom';
import { GENGAR } from '../../../domain/pokemon/ingredient-pokemon';
import { FIERY_HERB, PURE_OIL } from '../../../domain/produce/ingredient';
import { SLOWPOKE_TAIL_PEPPER_SALAD } from '../../../domain/recipe/salad';
import { CreateTierListRequestBody } from '../../../routes/tierlist-router/tierlist-router';
import { SetCover } from '../../set-cover/set-cover';
import { createPokemonByIngredientReverseIndex, memo } from '../../set-cover/set-cover-utils';
import { calculateProducePerMealWindow } from '../ingredient/ingredient-calculate';
import { getOptimalIngredientStats } from '../stats/stats-calculator';
import { calculateMealContributionFor, getAllOptimalIngredientPokemonProduce } from './contribution-calculator';

describe('getAllOptimalIngredientPokemonProduce', () => {
  it.todo('calculate all produce');
});

describe('calculateMealContributionFor', () => {
  it('shall calculate Gengars contribution and divide by 3 for slowpoke tail salad with size 3 team size', () => {
    const meal = SLOWPOKE_TAIL_PEPPER_SALAD;
    const pokemon = GENGAR;

    const customStats: CustomStats = getOptimalIngredientStats(60);

    const details: CreateTierListRequestBody = {
      curry: false,
      salad: false,
      dessert: false,
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      limit50: false,
      minRecipeBonus: 17,
      nrOfMeals: 3,
    };

    const detailedProduce = calculateProducePerMealWindow({
      pokemonCombination: {
        pokemon,
        ingredientList: [
          { amount: 2, ingredient: FIERY_HERB },
          { amount: 5, ingredient: FIERY_HERB },
          { amount: 8, ingredient: PURE_OIL },
        ],
      },
      customStats,
      e4eProcs: 0,
      helpingBonus: 0,
      goodCamp: false,
      combineIngredients: true,
    });

    const allPokemonWithProduce = getAllOptimalIngredientPokemonProduce(details);
    const reverseIndex = createPokemonByIngredientReverseIndex(allPokemonWithProduce);

    const memoizedSetCover: SetCover = new SetCover(
      reverseIndex,
      {
        limit50: details.limit50,
        pokemon: allPokemonWithProduce.map((p) => p.pokemonCombination.pokemon.name),
      },
      memo
    );
    const contribution = calculateMealContributionFor({
      meal,
      producedIngredients: detailedProduce.produce.ingredients,
      memoizedSetCover,
    });

    expect(contribution.percentage).toBe(71.42857142857143);
    expect(contribution.contributedPower).toBe(6238.680175862951);
  });
});
