import { BuddyForFlexibleRanking, BuddyForMeal } from '../../domain/legacy/buddy-types';
import {
  AllCombinationsForMealType,
  CombinationForFlexibleRankingType,
  CombinationForFocusedRankingType,
} from '../../domain/legacy/legacy';
import { OptimalSetResult } from '../../routes/optimal-router/optimal-router';
import { PokemonResult } from '../../routes/pokemon-router/pokemon-router';
import { prettifyIngredientDrop } from '../../utils/json/json-utils';
import { combineSameIngredientsInDrop } from '../calculator/ingredient/ingredient-calculate';

class CSVConverterServiceImpl {
  public toOptimalSet(data: OptimalSetResult) {
    const header = 'Member1,Member2,Member3,Member4,Member5,Filler Ingredients\n';
    const csvEntries = data.teams
      .map(
        (c, i) =>
          `${c.team.map((member) => member.pokemonCombination.pokemon.name).join(',')},${prettifyIngredientDrop(
            c.surplus.total
          ).replace(/,/g, ' ')}`
      )
      .join('\n');
    return header + csvEntries;
  }

  public toFlexibleRanking(data: CombinationForFlexibleRankingType[]) {
    const header = 'Rank,Pokemon,Average Percentage,Ingredient List';
    const prettyData = data
      .map(
        (ranking, i) =>
          `${i + 1},${ranking.pokemon},${ranking.averagePercentage},${prettifyIngredientDrop(
            ranking.ingredientList,
            ' '
          )}`
      )
      .join('\n');
    return header + '\n' + prettyData;
  }

  public toFocusedRanking(data: CombinationForFocusedRankingType[]) {
    const header = 'Rank,Pokemon,Combined Contribution,Meals,Ingredient List';
    const prettyData = data
      .map(
        (ranking, i) =>
          `${i + 1},${ranking.pokemon},${ranking.total},${ranking.meals.replace(/,/g, ' + ')},${prettifyIngredientDrop(
            ranking.ingredientList,
            ' '
          )}`
      )
      .join('\n');
    return header + '\n' + prettyData;
  }

  public toMealRanking(data: AllCombinationsForMealType) {
    const prettyData = 'Rank,Pokemon,Percentage,Produced Ingredients,Ingredient List\n';
    const csvEntries = data.combinations
      .map(
        (c, i) =>
          `${i + 1},${c.pokemon},${c.percentage},${prettifyIngredientDrop(
            c.producedIngredients,
            ' '
          )},${prettifyIngredientDrop(c.ingredientList, ' ')}`
      )
      .join('\n');
    return prettyData + csvEntries;
  }

  public toPokemonRanking(data: PokemonResult[]) {
    const header = `${data[0].pokemon.toUpperCase()},Ingredients Produced,Generalist Ranking,Average Percentage,${data[0].meals
      .map((meal) => meal.meal)
      .join(',')}`;

    const prettyData = data
      .map(
        (combination) =>
          `${prettifyIngredientDrop(combination.ingredientList, ' ')},${prettifyIngredientDrop(
            combination.ingredientsProduced,
            ' '
          )},${combination.generalistRanking},${combination.averagePercentage},${combination.meals
            .map((meal) => meal.percentage)
            .join(',')}`
      )
      .join('\n');

    return header + '\n' + prettyData;
  }

  public toFlexibleBuddyRanking(data: BuddyForFlexibleRanking[], queryPage?: number) {
    const page = queryPage ?? 1;
    const offset = page * 10 - 10;

    const header = 'Rank,Buddy Pairing,Average Percentage,Ingredient Lists\n';
    const prettyData = data
      .map(
        (combination, i) =>
          `${i + 1 + offset},${combination.buddy1_pokemon}+${combination.buddy2_pokemon},${
            combination.average_percentage
          },${prettifyIngredientDrop(combination.buddy1_ingredientList)} + ${prettifyIngredientDrop(
            combination.buddy2_ingredientList
          )}`
      )
      .join('\n');
    return header + prettyData;
  }

  public toBuddyForMealRanking(data: BuddyForMeal, queryPage?: number) {
    const page = queryPage ?? 1;
    const offset = page * 10 - 10;

    const header = 'Rank,Buddy Pairing,Percentage,Produced Ingredients,Ingredient Lists\n';
    const prettyData = data.combinations
      .map(
        (c, i) =>
          `${i + 1 + offset},${c.buddy1_pokemon}+${c.buddy2_pokemon},${c.percentage},${
            (prettifyIngredientDrop(
              combineSameIngredientsInDrop([...c.buddy1_producedIngredients, ...c.buddy2_producedIngredients])
            ),
            ' ')
          },${prettifyIngredientDrop(c.buddy1_ingredientList, ' ')} + ${prettifyIngredientDrop(
            c.buddy2_ingredientList,
            ' '
          )}`
      )
      .join('\n');
    return header + prettyData;
  }
}

export const CSVConverterService = new CSVConverterServiceImpl();
