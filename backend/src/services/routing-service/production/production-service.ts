import { CustomPokemonCombinationWithProduce, CustomStats } from '../../../domain/combination/custom';
import { PokemonError } from '../../../domain/error/pokemon/pokemon-error';
import { NatureError } from '../../../domain/error/stat/stat-error';
import { COMPLETE_POKEDEX } from '../../../domain/pokemon/pokemon';
import { NATURES, Nature } from '../../../domain/stat/nature';
import { SUBSKILLS, SubSkill } from '../../../domain/stat/subskill';
import { ProductionRequest } from '../../../routes/calculator-router/production-router';
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
  } = details;
  const pokemon = COMPLETE_POKEDEX.find((pokemon) => pokemon.name.toUpperCase() === pokemonName.toUpperCase());
  if (!pokemon) {
    throw new PokemonError("Can't find pokemon with name: " + pokemonName.toUpperCase());
  }

  const nature: Nature | undefined = NATURES.find((nature) => nature.name.toUpperCase() === natureName.toUpperCase());
  if (!nature) {
    throw new NatureError("Couldn't find nature with name: " + natureName.toUpperCase());
  }

  const subskills = extractSubskillsBasedOnLevel(level, subskillNames);

  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];
  for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
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
      e4eProcs: e4eProcs ?? 0,
      helpingBonus: helpingBonus ?? 0,
      goodCamp: goodCamp ?? false,
    },
    pokemonCombinations: pokemonProduction,
  };
}

function extractSubskillsBasedOnLevel(level: number, subskills: string[]): SubSkill[] {
  const subskill10 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[0]?.toUpperCase());
  const subskill25 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[1]?.toUpperCase());
  const subskill50 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[2]?.toUpperCase());
  const subskill75 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[3]?.toUpperCase());
  const subskill100 = SUBSKILLS.find((subskill) => subskill.name.toUpperCase() === subskills[4]?.toUpperCase());

  const result: SubSkill[] = [];
  if (level >= 10 && subskill10) {
    result.push(subskill10);
  }
  if (level >= 25 && subskill25) {
    result.push(subskill25);
  }
  if (level >= 50 && subskill50) {
    result.push(subskill50);
  }
  if (level >= 75 && subskill75) {
    result.push(subskill75);
  }
  if (level >= 100 && subskill100) {
    result.push(subskill100);
  }
  return result;
}
