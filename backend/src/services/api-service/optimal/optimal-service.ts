import { PokemonCombination } from '../../../domain/combination/combination';
import { Contribution } from '../../../domain/computed/coverage';
import { BERRIES, Berry } from '../../../domain/produce/berry';
import { MEALS, Meal } from '../../../domain/recipe/meal';
import { NATURES, Nature, RASH } from '../../../domain/stat/nature';
import { HELPING_SPEED_M, INGREDIENT_FINDER_M, INVENTORY_L, SubskillSet } from '../../../domain/stat/subskill';
import { getBerriesForFilter } from '../../../utils/berry-utils/berry-utils';
import { prettifyIngredientDrop } from '../../../utils/json/json-utils';
import { getMealsAboveBonus } from '../../../utils/meal-utils/meal-utils';
import {
  calculateOptimalProductionForSetCover,
  calculateSetCover,
} from '../../calculator/set-cover/calculate-set-cover';
import { subskillsForFilter } from '../../calculator/stats/stats-calculator';
// TODO: restructure file: its big, interfaces maybe not all used and quite similar, optimal-service doesnt really describe what it does, the scope is weird, stuff should probably be moved out
export interface OptimalTeamForMeal {
  pokemonCombinations: PokemonCombination[];
  meal: Meal;
}

interface PokemonCombinationContribution {
  totalContribution: number;
  contributions: Contribution[];
}

interface FlexiblePokemonCombination extends PokemonCombinationContribution {
  pokemonCombination: PokemonCombination;
}

export interface PokemonCombinationIntersection {
  pokemonCombinations: PokemonCombination[];
  meals: Meal[];
  // intersectionContributions: PokemonCombinationContribution; TODO: fix back
}

export function getOptimalPokemonFor(params: {
  name: string;
  limit50: boolean;
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  goodCamp: boolean;
  e4eProcs?: number;
  helpingBonus?: number;
  natureName?: string;
  subskillSet?: SubskillSet;
}) {
  const {
    name,
    limit50,
    goodCamp,
    e4eProcs = 0,
    helpingBonus = 0,
    natureName = RASH.name,
    subskillSet = 'optimal',
  } = params;
  const allowedBerries = getBerriesForFilter(params);

  const nature: Nature | undefined = NATURES.find((nature) => nature.name.toUpperCase() === natureName.toUpperCase());
  if (!nature) {
    throw new Error("Couldn't find nature with name: " + natureName.toUpperCase());
  }

  return customOptimalSet({ name, limit50, goodCamp, e4eProcs, helpingBonus, nature, subskillSet, allowedBerries });
}

export function getOptimalFlexiblePokemon() {
  const flexiblePokemonCombinations: FlexiblePokemonCombination[] = generateOptimalData().flexiblePokemon;

  const flexibleLategamePokemonCombinations = flexiblePokemonCombinations.map((pc) => {
    const filteredContributionsAbove17Percentage = pc.contributions.filter((cont) => cont.meal.bonus >= 17);
    const updatedTotalPower = filteredContributionsAbove17Percentage.reduce(
      (sum, curr) => sum + curr.contributedPower,
      0
    );

    return {
      pokemonCombination: pc.pokemonCombination,
      totalContribution: updatedTotalPower,
      contributions: filteredContributionsAbove17Percentage,
    };
  });

  return flexibleLategamePokemonCombinations.map((pokemonCombinationWithContribution) => ({
    pokemon: `${pokemonCombinationWithContribution.pokemonCombination.pokemon.name} (${prettifyIngredientDrop(
      pokemonCombinationWithContribution.pokemonCombination.ingredientList
    )})`,
    score: pokemonCombinationWithContribution.totalContribution,
    meals: pokemonCombinationWithContribution.contributions.map(
      (contribution) => `[${contribution.contributedPower}] ${contribution.meal.name}`
    ),
  }));
}

export function getOptimalSetTeamIntersections() {
  const data = generateOptimalData().optimalTeamCombinations;
  const intersections = getTeamIntersections(data);
  // const intersections: PokemonCombinationIntersection[] = getTeamIntersections(data);

  return intersections;
}

function generateOptimalData() {
  // TODO: all hard-coded
  const pokemonProduction = calculateOptimalProductionForSetCover({
    level: 60,
    nature: RASH,
    subskills: [INGREDIENT_FINDER_M, HELPING_SPEED_M, INVENTORY_L],
    allowedBerries: BERRIES,
    goodCamp: false,
    e4eProcs: 0,
    helpingBonus: 0,
  });

  const memoizedParams = new Map();

  // const optimalTeamCompositions: Map<sting, TeamDetails> = new Map();
  const pokemonOccurenceInOptimalSolutions: Map<string, PokemonCombinationContribution> = new Map();
  let optimalTeamCombinations: OptimalTeamForMeal[] = [];

  // TODO: but also should rank by contribution or something
  const mealsAbovePercentage = getMealsAboveBonus(0);
  for (const recipe of mealsAbovePercentage) {
    const teamCompositionsForMeal = calculateSetCover({
      recipe: recipe.ingredients,
      pokemonProduction,
      memoizedParams,
    });

    if (teamCompositionsForMeal.length > 5000) {
      console.warn('Excluding recipe: ' + recipe.name);
      continue;
    }
    console.log('Calced for: ' + recipe.name);

    const contribution: Contribution = {
      meal: recipe,
      percentage: 100,
      contributedPower: recipe.value50,
    };

    const optimalPokemonCombinationsForMeal: PokemonCombination[] = teamCompositionsForMeal.flatMap((comp) =>
      comp.team.map((member) => member.pokemonCombination)
    );

    const uniqueOptimalPokemonCombinationsForMeal: PokemonCombination[] = removeDuplicates(
      optimalPokemonCombinationsForMeal
    );

    const allTeamsForMeal: OptimalTeamForMeal[] = teamCompositionsForMeal.map((comp) => ({
      pokemonCombinations: comp.team.map((team) => team.pokemonCombination),
      meal: recipe,
    }));
    optimalTeamCombinations = optimalTeamCombinations.concat(allTeamsForMeal);

    for (const pokemonCombination of uniqueOptimalPokemonCombinationsForMeal) {
      const key = JSON.stringify(pokemonCombination);

      if (!pokemonOccurenceInOptimalSolutions.has(key)) {
        pokemonOccurenceInOptimalSolutions.set(key, {
          contributions: [contribution],
          totalContribution: contribution.contributedPower,
        });
      } else {
        const pokemonCombinationToUpdate = pokemonOccurenceInOptimalSolutions.get(key)!;

        pokemonOccurenceInOptimalSolutions.set(key, {
          totalContribution: pokemonCombinationToUpdate.totalContribution + contribution.contributedPower,
          contributions: pokemonCombinationToUpdate.contributions.concat(contribution),
        });
      }
    }
  }

  const sortedOptimalFlexiblePokemon = Array.from(pokemonOccurenceInOptimalSolutions)
    .map((pokemonCombinationWithContribution) => ({
      ...pokemonCombinationWithContribution[1],
      pokemonCombination: JSON.parse(pokemonCombinationWithContribution[0]) as PokemonCombination,
    }))
    .sort((a, b) => b.totalContribution - a.totalContribution);

  return {
    flexiblePokemon: sortedOptimalFlexiblePokemon,
    optimalTeamCombinations,
  };
}

export function getTeamIntersections(data: OptimalTeamForMeal[]) {
  const hash = hashOptimalTeamsForMeal(data);
  console.log('hash finished');

  const output = findIntersections(hash);

  return output;
}

// TODO: rename. this finds and hashes all unique teams and stores all meals they can make
export function hashOptimalTeamsForMeal(data: OptimalTeamForMeal[]) {
  const simplifiedData = data.map((team) => ({
    pokemonCombinations: team.pokemonCombinations.map(
      (pc) => `${pc.pokemon.name}(${prettifyIngredientDrop(pc.ingredientList, ' / ')})`
    ),
    meal: team.meal.name,
  }));
  const hash: { [key: string]: { count: number; meals: string[] } } = {};
  for (const team of simplifiedData) {
    const key = team.pokemonCombinations.sort().join();
    if (hash[key]) {
      hash[key].count++;
      hash[key].meals.push(team.meal);
    } else {
      hash[key] = { count: 1, meals: [team.meal] };
    }
  }
  return hash;
}

export function findIntersections(hash: {
  [key: string]: {
    count: number;
    meals: string[];
  };
}) {
  const output: { [key: string]: { meals: Set<string>; pokemonCombinations: string[] } } = {};
  const keys = Object.keys(hash);

  // Step 1: Map individual Pokémon to their hash keys
  const pokemonToHashes: Map<string, Set<string>> = new Map();

  keys.forEach((hashKey) => {
    hashKey.split(',').forEach((pokemon) => {
      if (!pokemonToHashes.has(pokemon)) {
        pokemonToHashes.set(pokemon, new Set());
      }
      pokemonToHashes.get(pokemon)!.add(hashKey);
    });
  });

  // Step 2: Iterate over each key and find intersections, skipping single Pokémon combinations
  keys.forEach((hashKey) => {
    const pokemons = hashKey.split(',');
    if (pokemons.length <= 1) {
      // Skip processing if there is only one Pokémon in the combination
      return;
    }

    const intersectionHashes = new Set<string>();

    pokemons.forEach((pokemon) => {
      const hashes = pokemonToHashes.get(pokemon);
      hashes!.forEach((h) => {
        if (pokemons.every((p) => h.includes(p))) {
          intersectionHashes.add(h);
        }
      });
    });

    // Step 3: Combine meals for the intersections
    const meals = new Set<string>();
    intersectionHashes.forEach((intersectionKey) => {
      hash[intersectionKey].meals.forEach((meal) => meals.add(meal));
    });

    const sortedPokemons = pokemons.sort().join();
    if (!output[sortedPokemons]) {
      output[sortedPokemons] = { meals, pokemonCombinations: pokemons };
    } else {
      meals.forEach((meal) => output[sortedPokemons].meals.add(meal));
    }
  });

  // Step 4: Convert the output to the desired format, filtering out entries with only one meal
  const outputArray = Object.values(output)
    .filter(({ meals }) => meals.size > 1)
    .map(({ meals, pokemonCombinations }) => {
      const mealsWithData = Array.from(meals).map((meal) => {
        const mealData = MEALS.find((m) => m.name.toLowerCase() === meal.toLowerCase());
        if (!mealData) {
          throw new Error("Somehow didn't find meal with name: " + meal);
        }
        return mealData;
      });

      const { score, countedMeals } = calculateIntersectionScore(mealsWithData);

      return {
        pokemonCombinations,
        score,
        countedMeals: countedMeals.map((m) => m.name),
        meals: mealsWithData.map((m) => m.name),
      };
    });

  // Separate sorting step
  outputArray.sort((a, b) => b.score - a.score || b.pokemonCombinations.length - a.pokemonCombinations.length);

  return outputArray;
}

function hashPokemonCombination(pc: PokemonCombination): string {
  return pc.pokemon.name + ':' + pc.ingredientList.map((i) => i.ingredient.name).join(',');
}

function removeDuplicates(pokemonCombinations: PokemonCombination[]): PokemonCombination[] {
  const seen = new Set<string>();
  const result: PokemonCombination[] = [];
  for (const pc of pokemonCombinations) {
    const hash = hashPokemonCombination(pc);
    if (!seen.has(hash)) {
      seen.add(hash);
      result.push(pc);
    }
  }
  return result;
}

// TODO: change, best per meal type? percentage of team size?
function calculateIntersectionScore(meals: Meal[]): { score: number; countedMeals: Meal[] } {
  const highestMealsByType: Record<string, Meal> = {};

  meals.forEach((meal) => {
    // Check if the current meal's value50 is higher than the stored one for its type
    if (!highestMealsByType[meal.type] || meal.value50 > highestMealsByType[meal.type].value50) {
      highestMealsByType[meal.type] = meal;
    }
  });

  // Sum up the highest values for each type and collect the corresponding meals
  let score = 0;
  const countedMeals: Meal[] = [];

  Object.values(highestMealsByType).forEach((meal) => {
    score += meal.value50;
    countedMeals.push(meal);
  });

  return { score, countedMeals };
}

function customOptimalSet(params: {
  name: string;
  limit50: boolean;
  goodCamp: boolean;
  e4eProcs: number;
  helpingBonus: number;
  nature: Nature;
  subskillSet: SubskillSet;
  allowedBerries: Berry[];
}) {
  const { name, limit50, goodCamp, e4eProcs, helpingBonus, nature, subskillSet, allowedBerries } = params;

  const meal: Meal | undefined = MEALS.find((meal) => meal.name === name.toUpperCase());
  if (!meal) {
    throw new Error("Couldn't find meal with name: " + name.toUpperCase());
  }

  const level = limit50 ? 50 : 60;
  const subskills = subskillsForFilter(subskillSet);

  const pokemonProduction = calculateOptimalProductionForSetCover({
    level,
    nature,
    subskills,
    allowedBerries,
    goodCamp,
    e4eProcs,
    helpingBonus,
  });

  const optimalCombinations = calculateSetCover({
    recipe: meal.ingredients,
    pokemonProduction,
    memoizedParams: new Map(),
  });

  return {
    bonus: meal.bonus,
    meal: meal.name,
    recipe: meal.ingredients,
    value: meal.value,
    filter: {
      level,
      nature,
      subskills,
      e4eProcs,
      helpingBonus,
      goodCamp,
    },
    teams: optimalCombinations.map(({ team, sumSurplus, prettySurplus, prettyCombinedProduce }) => ({
      sumSurplus,
      prettySurplus,
      prettyCombinedProduce,
      member1: team[0],
      member2: team.at(1),
      member3: team.at(2),
      member4: team.at(3),
      member5: team.at(4),
    })),
  };
}
