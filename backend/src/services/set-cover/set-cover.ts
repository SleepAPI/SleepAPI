/**
 * Copyright 2023 Sleep API Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { OptimalTeamSolution } from '@src/domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { ProgrammingError } from '@src/domain/error/programming/programming-error';
import { hashPokemonCombination } from '@src/utils/optimal-utils/optimal-utils';
import { IngredientSet, MEALS_IN_DAY, combineSameIngredientsInDrop, mainskill } from 'sleepapi-common';
import {
  calculateHelperBoostIngredientsIncrease,
  calculateRemainingSimplifiedIngredients,
  countNrOfHelperBoostHelps,
  countUniqueHelperBoostPokemon,
  createMemoKey,
  parseMemoKey,
  sumOfSimplifiedIngredients,
} from '../../utils/set-cover-utils/set-cover-utils';
import {
  addIngredientSet,
  calculateRemainingIngredients,
  extractRelevantSurplus,
  sortByMinimumFiller,
} from '../calculator/ingredient/ingredient-calculate';

export interface SimplifiedIngredientSet {
  amount: number;
  ingredient: string;
}
export interface HelperBoostStatus {
  amount: number;
  berry: string;
}

export interface MemoizedParameters {
  remainingIngredients: SimplifiedIngredientSet[];
  spotsLeftInTeam: number;
  helperBoost?: HelperBoostStatus;
}

export class SetCover {
  #reverseIndex: Map<string, CustomPokemonCombinationWithProduce[]> = new Map();
  #memo: Map<string, CustomPokemonCombinationWithProduce[][]>;

  #startTime: number = Date.now();
  #timeout = 10000;

  constructor(
    reverseIndex: Map<string, CustomPokemonCombinationWithProduce[]>,
    memo: Map<string, CustomPokemonCombinationWithProduce[][]>
  ) {
    this.#reverseIndex = reverseIndex;
    this.#memo = memo;
  }

  // TODO: should rewrite helper boost to alway assume the base is already calculated for raikou, so if raikou is added to team we only add unique, like if team had raichu already we add unique helper boost help to raikou, not the base, but raichu would get base + unique
  public solveRecipe(
    params: string,
    pokemonInTeam: CustomPokemonCombinationWithProduce[] = [],
    requiredPokemon: CustomPokemonCombinationWithProduce[] = []
  ): CustomPokemonCombinationWithProduce[][] {
    const cachedSolution = this.#memo.get(params);
    if (cachedSolution) {
      return cachedSolution;
    }

    const memoizedParams: MemoizedParameters = parseMemoKey(params);
    const { spotsLeftInTeam, remainingIngredients: mealIngredients } = memoizedParams;
    if (spotsLeftInTeam === 0 || mealIngredients.length === 0 || this.checkTimeout()) {
      return [];
    }

    let maxTeamSize = spotsLeftInTeam;

    // Take the first un-fulfilled ingredient requirement
    const firstIngredient = mealIngredients[0];

    // For each pokemon that produces the ingredient, go through and
    // determine how many ingredients remain in the recipe if we add
    // that pokemon to our team
    const remainders: [
      number,
      SimplifiedIngredientSet[],
      CustomPokemonCombinationWithProduce,
      CustomPokemonCombinationWithProduce[],
      HelperBoostStatus | undefined
    ][] = [];

    // TODO: currrently for requiredPokemon legnth > 2+ we would iterate over them instead of adding them all to the same team
    // TODO: instead for [RAIKOU, RAICHU, EKANS] we should calc RAIKOU and send requiredPokemon=[RAICHU, EKANS] to next recursive
    const pokemonWithIngredient =
      requiredPokemon.length > 0 ? requiredPokemon : this.#reverseIndex.get(firstIngredient.ingredient) ?? [];
    for (const currentPokemon of pokemonWithIngredient) {
      const helperBoostAlreadyInTeam = pokemonInTeam.find(
        (pkmn) => pkmn.pokemonCombination.pokemon.skill === mainskill.HELPER_BOOST
      );

      if (helperBoostAlreadyInTeam && currentPokemon.pokemonCombination.pokemon.skill === mainskill.HELPER_BOOST) {
        // team already has special pokemon, can't add another
        continue;
      }

      const currentTeam = pokemonInTeam.concat(currentPokemon);
      const maybeHelperBoostPokemon = currentTeam.find(
        (pkmn) => pkmn.pokemonCombination.pokemon.skill === mainskill.HELPER_BOOST
      );

      if (maybeHelperBoostPokemon) {
        const boostedBerry = maybeHelperBoostPokemon.pokemonCombination.pokemon.berry;
        const uniqueBoostedMons = countUniqueHelperBoostPokemon(currentTeam, boostedBerry);
        const currentNrOfHelps = countNrOfHelperBoostHelps({
          uniqueBoostedMons,
          skillProcs: maybeHelperBoostPokemon.detailedProduce.averageTotalSkillProcs / MEALS_IN_DAY,
          skillLevel: maybeHelperBoostPokemon.customStats.skillLevel,
        });

        const deductedExtraHelperBoostIncrease = calculateRemainingSimplifiedIngredients(
          mealIngredients,
          calculateHelperBoostIngredientsIncrease(currentTeam, currentNrOfHelps),
          true
        );

        const remainder: SimplifiedIngredientSet[] = calculateRemainingSimplifiedIngredients(
          deductedExtraHelperBoostIncrease,
          currentPokemon.detailedProduce.produce.ingredients,
          true
        );

        const sum = sumOfSimplifiedIngredients(remainder);
        const helperBoost: HelperBoostStatus = {
          amount: uniqueBoostedMons,
          berry: boostedBerry.name,
        };
        remainders.push([sum, remainder, currentPokemon, currentTeam, helperBoost]);
      } else {
        const remainder: SimplifiedIngredientSet[] = calculateRemainingSimplifiedIngredients(
          mealIngredients,
          currentPokemon.detailedProduce.produce.ingredients,
          true
        );
        const sum = sumOfSimplifiedIngredients(remainder);
        remainders.push([sum, remainder, currentPokemon, currentTeam, undefined]);
      }
    }
    // Sort the possible teams by quantity of remaining ingredients
    remainders.sort((a, b) => a[0] - b[0]);

    let teams: CustomPokemonCombinationWithProduce[][] = [];
    for (let i = 0, len = remainders.length; i < len; i++) {
      const [sumr, remainder, poke, currentTeam, helperBoost] = remainders[i];

      if (sumr > 0) {
        // If there are remaining ingredients after adding this pokemon,
        // and we haven't hit the team size limit, recurse and solve for
        // the remaining ingredients
        if (maxTeamSize > 1) {
          const updatedParams: MemoizedParameters = {
            remainingIngredients: remainder,
            spotsLeftInTeam: maxTeamSize - 1,
            helperBoost,
          };
          const key = createMemoKey(updatedParams);

          const subTeams: CustomPokemonCombinationWithProduce[][] = this.solveRecipe(key, currentTeam);
          if (requiredPokemon.length === 0) {
            this.#memo.set(key, subTeams); // expand memo since we didnt have this solve yet
          }

          if (!subTeams) {
            throw new ProgrammingError(
              'Should not happen since we check maxTeamSize > 1, and we return only undefined for 0'
            );
          }
          if (subTeams.length == 0) {
            // If there are no teams that can solve the remaining ingredients
            // within our team size limit, just move on
            continue;
          }
          const subTeamSize = subTeams[0].length;

          if (subTeamSize + 1 < maxTeamSize) {
            // If our new team solves the recipe and is smaller than our current
            // best team, clear out our list of top teams, add the current
            // pokemon to each subteam, then add all subteams to the list of
            // best teams
            teams = subTeams.map((s) => s.concat(poke)).sort();
            maxTeamSize = subTeamSize + 1;
          } else if (subTeamSize + 1 === maxTeamSize) {
            // If the subteams plus our pokemon are the same size as the current
            // best team, add all subteams
            teams = teams.concat(subTeams.map((s) => s.concat(poke)).sort());
          }
        } else {
          // hit the team limit
          continue;
        }
      } else {
        // Our pokemon solves the remaining ingredients all by itself
        if (maxTeamSize > 1) {
          // If the best current team is bigger than one,
          // remove them all and replace with just our pokemon
          teams = [[poke]];
          maxTeamSize = 1;
        } else if (maxTeamSize === 1) {
          // If the best current team is also size one,
          // add our pokemon as another team
          teams = teams.concat([[poke]]);
        }
      }
    }

    if (requiredPokemon.length === 0) {
      this.#memo.set(params, teams);
    }
    return teams;
  }

  private checkTimeout() {
    if (Date.now() - this.#startTime >= this.#timeout) {
      return true;
    }
    return false;
  }

  public calculateDetailsAndSortBySumSurplus(
    solutions: CustomPokemonCombinationWithProduce[][],
    recipe: IngredientSet[]
  ): OptimalTeamSolution[] {
    if (!solutions) {
      return [];
    }

    const exhaustive = !this.checkTimeout();

    const teamsWithDetails: OptimalTeamSolution[] = [];
    for (const team of solutions) {
      let addedHelps = 0;
      const maybeHelperBoostPokemon = team.find(
        (pkmn) => pkmn.pokemonCombination.pokemon.skill === mainskill.HELPER_BOOST
      );

      if (maybeHelperBoostPokemon) {
        const uniqueBoostedMons = countUniqueHelperBoostPokemon(
          team,
          maybeHelperBoostPokemon.pokemonCombination.pokemon.berry
        );

        addedHelps = countNrOfHelperBoostHelps({
          uniqueBoostedMons,
          skillProcs: maybeHelperBoostPokemon.detailedProduce.averageTotalSkillProcs / MEALS_IN_DAY,
          skillLevel: maybeHelperBoostPokemon.customStats.skillLevel,
        });
      }

      const updatedTeam: CustomPokemonCombinationWithProduce[] = team.map((member) => ({
        ...member,
        detailedProduce: {
          ...member.detailedProduce,
          produce: {
            ingredients: addIngredientSet(
              member.detailedProduce.produce.ingredients,
              member.averageProduce.ingredients.map(({ amount, ingredient }) => ({
                ingredient,
                amount: amount * addedHelps,
              }))
            ),
            berries: member.detailedProduce.produce.berries && {
              amount:
                member.detailedProduce.produce.berries.amount +
                addedHelps * (member.averageProduce.berries?.amount ?? 0),
              berry: member.detailedProduce.produce.berries.berry,
            },
          },
        },
      }));

      const teamIngredients = updatedTeam.flatMap((t) => t.detailedProduce.produce.ingredients);
      const totalSurplus = calculateRemainingIngredients(combineSameIngredientsInDrop(teamIngredients), recipe);
      const surplus = extractRelevantSurplus(recipe, totalSurplus);
      const teamWithDetails: OptimalTeamSolution = {
        team: updatedTeam,
        surplus,
        exhaustive,
      };

      teamsWithDetails.push(teamWithDetails);
    }

    const sortedByFiller = sortByMinimumFiller(teamsWithDetails, recipe);
    return this.processOptimalTeamSolutions(sortedByFiller);
  }

  public processOptimalTeamSolutions(optimalTeamSolutions: OptimalTeamSolution[]): OptimalTeamSolution[] {
    optimalTeamSolutions.forEach((solution) => {
      solution.team.sort((a, b) =>
        hashPokemonCombination(a.pokemonCombination).localeCompare(hashPokemonCombination(b.pokemonCombination))
      );
    });

    return this.removeDuplicateTeams(optimalTeamSolutions);
  }

  public removeDuplicateTeams(optimalTeamSolutions: OptimalTeamSolution[]): OptimalTeamSolution[] {
    const uniqueTeamHashes = new Set<string>();
    return optimalTeamSolutions.filter((solution) => {
      const teamHash = solution.team.map((pc) => hashPokemonCombination(pc.pokemonCombination)).join('|');
      if (uniqueTeamHashes.has(teamHash)) {
        return false;
      } else {
        uniqueTeamHashes.add(teamHash);
        return true;
      }
    });
  }

  public findOptimalCombinationFor(
    recipe: IngredientSet[],
    startingPokemon?: CustomPokemonCombinationWithProduce[],
    maxTeamSize?: number,
    timeout?: number
  ): OptimalTeamSolution[] {
    this.#startTime = Date.now();
    this.#timeout = timeout ?? this.#timeout;

    const spotsLeftInTeam = maxTeamSize ?? 5;

    const params: MemoizedParameters = {
      remainingIngredients: recipe.map((ing) => ({
        amount: ing.amount,
        ingredient: ing.ingredient.name,
      })),
      spotsLeftInTeam,
    };

    const key = createMemoKey(params);
    const solutions = this.#memo.get(key) ?? this.solveRecipe(key, [], startingPokemon);

    return this.calculateDetailsAndSortBySumSurplus(solutions, recipe) ?? [];
  }

  public calculateMinTeamSizeFor(
    recipe: IngredientSet[],
    startingPokemon: CustomPokemonCombinationWithProduce[],
    maxTeamSize?: number,
    timeout?: number
  ) {
    this.#startTime = Date.now();
    this.#timeout = timeout ?? this.#timeout;

    const spotsLeftInTeam = maxTeamSize ?? 5;

    const params: MemoizedParameters = {
      remainingIngredients: recipe.map((ing) => ({
        amount: ing.amount,
        ingredient: ing.ingredient.name,
      })),
      spotsLeftInTeam: spotsLeftInTeam,
    };

    const key = createMemoKey(params);
    const solutions = this.#memo.get(key) ?? this.solveRecipe(key, [], startingPokemon);

    return solutions.at(0) ? solutions[0].length : spotsLeftInTeam + 1;
  }
}
