import { CustomPokemonCombinationWithProduce, CustomStats } from '../../../domain/combination/custom';
import { ProductionRequest } from '../../../routes/calculator-router/production-router';
import { getNature } from '../../../utils/nature-utils/nature-utils';
import { getPokemon } from '../../../utils/pokemon-utils/pokemon-utils';
import { chooseIngredientSets } from '../../../utils/production-utils/production-utils';
import { extractSubskillsBasedOnLevel } from '../../../utils/subskill-utils/subskill-utils';
import {
  calculateProducePerMealWindow,
  getAllIngredientCombinationsForLevel,
} from '../../calculator/ingredient/ingredient-calculate';

export function calculatePokemonProduction(pokemonName: string, details: ProductionRequest) {
  const {
    level,
    nature: natureName,
    subskills: subskillNames,
    e4e: e4eProcs,
    helpingbonus: helpingBonus,
    camp: goodCamp,
    ingredientSet,
  } = details;

  const pokemon = getPokemon(pokemonName);
  const nature = getNature(natureName);
  const subskills = extractSubskillsBasedOnLevel(level, subskillNames);
  const ingredientSets = chooseIngredientSets(getAllIngredientCombinationsForLevel(pokemon, level), ingredientSet);

  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];
  for (const ingredientList of ingredientSets) {
    const customStats: CustomStats = {
      level,
      nature,
      subskills,
    };

    const detailedProduce = calculateProducePerMealWindow({
      pokemonCombination: {
        pokemon: pokemon,
        ingredientList,
      },
      customStats,
      e4eProcs,
      goodCamp,
      helpingBonus,
      combineIngredients: true,
    });

    pokemonProduction.push({ pokemonCombination: { pokemon, ingredientList }, detailedProduce, customStats });
  }
  return {
    filters: {
      level,
      nature,
      subskills,
      e4eProcs,
      helpingBonus,
      goodCamp,
    },
    pokemonCombinations: pokemonProduction,
  };
}
