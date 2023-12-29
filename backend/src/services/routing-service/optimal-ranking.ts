import { Berry } from '../../domain/produce/berry';
import { Meal, MEALS } from '../../domain/recipe/meal';
import { Nature, NATURES, RASH } from '../../domain/stat/nature';
import { SubskillSet } from '../../domain/stat/subskill';
import { getBerriesForFilter } from '../../utils/berry-utils/berry-utils';
import { calculateSetCover } from '../calculator/set-cover/calculate-set-cover';
import { subskillsForFilter } from '../calculator/stats/stats-calculator';

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

  const optimalCombinations = calculateSetCover({
    recipe: meal.ingredients,
    level,
    nature,
    subskills,
    allowedBerries,
    goodCamp,
    e4eProcs,
    helpingBonus,
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
