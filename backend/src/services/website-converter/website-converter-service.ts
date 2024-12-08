import { SurplusIngredients } from '@src/domain/combination/combination.js';
import { SetCoverPokemonStats } from '@src/domain/computed/production.js';
import { ScheduledEvent } from '@src/domain/event/event.js';
import { IngredientRankerResult, OptimalSetResult } from '@src/routes/solve-router/solve-router.js';
// import { TieredPokemonCombinationContribution } from '@src/routes/tierlist-router/tierlist-router.js';
import {
  DetailedProduce,
  IngredientSet,
  MEALS_IN_DAY,
  MathUtils,
  PokemonWithIngredients,
  Summary,
  flatToIngredientSet,
  mainskill,
  nature,
  prettifyBerries,
  prettifyIngredientDrop,
  shortPrettifyIngredientDrop
} from 'sleepapi-common';
import { calculateHelperBoostHelpsFromUnique } from '../calculator/skill/skill-calculator.js';

// --- production calculator
interface ProductionFilters {
  level: number;
  ribbon: number;
  nature?: nature.Nature;
  subskills?: Set<string>;
  skillLevel?: number;
  inventoryLimit?: number;
  e4eProcs: number;
  e4eLevel: number;
  helperBoostProcs: number;
  helperBoostUnique: number;
  helperBoostLevel: number;
  helpingBonus: number;
  camp: boolean;
}

interface ProductionCombination {
  filters: ProductionFilters;
  production: {
    pokemonCombination: PokemonWithIngredients;
    detailedProduce: DetailedProduce;
  };
  summary: Summary;
  log: ScheduledEvent[];
  neutralProduction?: DetailedProduce;
  optimalIngredientProduction?: DetailedProduce;
  optimalBerryProduction?: DetailedProduce;
  optimalSkillProduction?: DetailedProduce;
}

class WebsiteConverterServiceImpl {
  public toProductionCalculator(pokemonProduction: ProductionCombination) {
    return {
      details: pokemonProduction.filters,
      production: {
        details: this.#prettifyProductionDetails(pokemonProduction),
        pokemon: pokemonProduction.production.pokemonCombination.pokemon.name,
        ingredients: pokemonProduction.production.pokemonCombination.ingredientList.map((ing) => ing.ingredient.name),
        specialty: pokemonProduction.production.pokemonCombination.pokemon.specialty,
        log: pokemonProduction.log,
        logName: `eventlog-${pokemonProduction.production.pokemonCombination.pokemon.name}${
          pokemonProduction.filters.level
        }-${Date.now()}.txt`,
        prettyLog: pokemonProduction.log.map((event) => event.format()).join('\n')
      },
      neutralProduction: pokemonProduction.neutralProduction && {
        ingredients: pokemonProduction.neutralProduction.produce.ingredients,
        berries: pokemonProduction.neutralProduction.produce.berries,
        skills: pokemonProduction.neutralProduction.skillActivations.reduce((sum, cur) => sum + cur.adjustedAmount, 0)
      },
      userProduction: {
        ingredients: pokemonProduction.production.detailedProduce.produce.ingredients,
        berries: pokemonProduction.production.detailedProduce.produce.berries,
        skills: pokemonProduction.production.detailedProduce.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      },
      optimalIngredientProduction: pokemonProduction.optimalIngredientProduction && {
        ingredients: pokemonProduction.optimalIngredientProduction.produce.ingredients,
        berries: pokemonProduction.optimalIngredientProduction.produce.berries,
        skills: pokemonProduction.optimalIngredientProduction.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      },
      optimalBerryProduction: pokemonProduction.optimalBerryProduction && {
        ingredients: pokemonProduction.optimalBerryProduction.produce.ingredients,
        berries: pokemonProduction.optimalBerryProduction.produce.berries,
        skills: pokemonProduction.optimalBerryProduction.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      },
      optimalSkillProduction: pokemonProduction.optimalSkillProduction && {
        ingredients: pokemonProduction.optimalSkillProduction.produce.ingredients,
        berries: pokemonProduction.optimalSkillProduction.produce.berries,
        skills: pokemonProduction.optimalSkillProduction.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      }
    };
  }

  // public toTierList(tieredData: TieredPokemonCombinationContribution[]) {
  //   const mapWithTiering: Map<string, { pokemon: string; ingredientList: string; diff?: number; details: string }[]> =
  //     new Map();
  //   for (const tieredEntry of tieredData) {
  //     const allEntriesOfPokemon = tieredData.filter(
  //       (allPokemon) =>
  //         allPokemon.pokemonCombinationContribution.pokemonCombination.pokemon ===
  //         tieredEntry.pokemonCombinationContribution.pokemonCombination.pokemon
  //     );

  //     const prettyEntry = {
  //       pokemon: tieredEntry.pokemonCombinationContribution.pokemonCombination.pokemon,
  //       ingredientList: prettifyIngredientDrop(
  //         tieredEntry.pokemonCombinationContribution.pokemonCombination.ingredients
  //       ),
  //       diff: tieredEntry.diff,
  //       details: allEntriesOfPokemon
  //         .map(
  //           ({ tier, pokemonCombinationContribution: otherPairingsEntry }) =>
  //             `[${tier}] (${prettifyIngredientDrop(otherPairingsEntry.pokemonCombination.ingredients)})\n` +
  //             `Total score: ${Math.round(otherPairingsEntry.combinedContribution.score)}` +
  //             `${
  //               (otherPairingsEntry.combinedContribution.contributions[0].skillValue ?? 0) > 0
  //                 ? `, support value: ${Math.round(
  //                     otherPairingsEntry.combinedContribution.contributions.reduce(
  //                       (sum, cur) => sum + (cur.skillValue ?? 0),
  //                       0
  //                     )
  //                   )}`
  //                 : ''
  //             }\n` +
  //             `${otherPairingsEntry.combinedContribution.contributions
  //               .map(
  //                 (meal) =>
  //                   `[${Math.round(meal.contributedPower)} ${MathUtils.round(meal.percentage, 1)}%] ${meal.meal.name
  //                     .toLowerCase()
  //                     .replace(/_/g, ' ')}`
  //                 // \nExample solve: ${
  //                 // meal.team
  //                 //   ?.map(
  //                 //     (member) =>
  //                 //       `${capitalize(member.pokemon.name)}(${shortPrettifyIngredientDrop(
  //                 //         member.ingredientList
  //                 //       )})`
  //                 //   )
  //                 //   .join(', ') ?? 'no team'
  //                 // }`
  //               )
  //               .join('\n')}`
  //         )
  //         .join('\n\n'),
  //     };

  //     if (!mapWithTiering.has(tieredEntry.tier)) {
  //       mapWithTiering.set(tieredEntry.tier, [prettyEntry]);
  //     } else {
  //       const array = mapWithTiering.get(tieredEntry.tier);
  //       if (array !== undefined) {
  //         array.push(prettyEntry);
  //       }
  //     }
  //   }

  //   const tiersWithPokemonDetails: {
  //     tier: string;
  //     pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
  //   }[] = [];
  //   for (const [tier, pokemonWithDetails] of mapWithTiering) {
  //     tiersWithPokemonDetails.push({ tier, pokemonWithDetails });
  //   }

  //   return this.#filterOnlyBest(tiersWithPokemonDetails);
  // }

  public toIngredientRanker(optimalMons: IngredientRankerResult) {
    const prettifiedCombinations = optimalMons.teams.slice(0, 500).map((solution) => ({
      team: solution.team
        .map((member) => `${member.pokemonSet.pokemon}(${shortPrettifyIngredientDrop(member.pokemonSet.ingredients)})`)
        .join(),
      details: `👨🏻‍🍳 Ingredient ranker - https://sleepapi.net 👨🏻‍🍳\n\nIngredient: ${
        optimalMons.ingredient
      }\n\nPokemon\n- ${solution.team
        .map((member) => `${member.pokemonSet.pokemon}(${shortPrettifyIngredientDrop(member.pokemonSet.ingredients)})`)
        .join()}
        \n\nProduce per meal window\n${solution.team
          .map(
            (member) =>
              `${member.pokemonSet.pokemon}: ${prettifyIngredientDrop(member.totalIngredients)} (${MathUtils.round(
                member.skillProcs / MEALS_IN_DAY,
                1
              )} skill procs)`
          )
          .join()}`
    }));

    return {
      ingredient: optimalMons.ingredient,
      info:
        optimalMons.teams.length > 0
          ? !optimalMons.teams.at(0)?.exhaustive
            ? `Showing ${prettifiedCombinations.length} of ${optimalMons.teams.length} Pokemon.\nTimeout of 10 seconds reached, results may not be exhaustive`
            : `${prettifiedCombinations.length} Pokemon found`
          : "No possible Pokemon found, can't be found with current filter",
      teams: prettifiedCombinations
    };
  }

  public toOptimalSet(optimalCombinations: OptimalSetResult) {
    const prettifiedRecipe = prettifyIngredientDrop(optimalCombinations.recipe);
    const prettifiedCombinations = optimalCombinations.teams.slice(0, 500).map((solution) => ({
      team: solution.team
        .map((member) => `${member.pokemonSet.pokemon}(${shortPrettifyIngredientDrop(member.pokemonSet.ingredients)})`)
        .join(', '),
      details: `👨🏻‍🍳 Team finder - https://sleepapi.net 👨🏻‍🍳\n\nRecipe: ${
        optimalCombinations.meal
      } (${prettifiedRecipe})\n\nTeam\n- ${solution.team
        .map((member) => `${member.pokemonSet.pokemon}(${shortPrettifyIngredientDrop(member.pokemonSet.ingredients)})`)
        .join('\n- ')}\n${this.#prettifyInput(optimalCombinations.filter)}\nFiller ingredients produced\n${
        solution.surplus.relevant.length > 0
          ? `${this.#prettifyFillersForRecipe(optimalCombinations.recipe, solution.surplus)}`
          : ''
      }\n\nIndividual produce per meal window\n${solution.team
        .map(
          (member) =>
            `${member.pokemonSet.pokemon}: ${prettifyIngredientDrop(member.totalIngredients)} (${MathUtils.round(
              member.skillProcs / MEALS_IN_DAY,
              1
            )} skill procs)`
        )
        .join('\n')}`
    }));

    return {
      meal: optimalCombinations.meal,
      info:
        optimalCombinations.teams.length > 0
          ? !optimalCombinations.teams.at(0)?.exhaustive
            ? `Requires ${optimalCombinations.teams.at(0)?.team.length} Pokémon for 100% coverage, showing ${
                prettifiedCombinations.length
              } of ${
                optimalCombinations.teams.length
              } solutions.\nTimeout of 10 seconds reached, results may not be exhaustive`
            : `Requires ${optimalCombinations.teams.at(0)?.team.length} Pokémon for 100% coverage, showing ${
                prettifiedCombinations.length
              } of ${optimalCombinations.teams.length} solutions`
          : 'No possible team combinations for 100% coverage found, cant be made with current filter',
      recipe: prettifiedRecipe,
      bonus: optimalCombinations.bonus,
      value: optimalCombinations.value,
      teams: prettifiedCombinations
    };
  }

  #prettifyFiltersDetails(productionCombination: ProductionCombination) {
    const filters = productionCombination.filters;

    let prettyString = `-------------\n`;

    prettyString +=
      `Level: ${productionCombination.filters.level}, Nature: ${
        productionCombination.filters.nature?.prettyName ?? 'None'
      }\n` +
      `Main skill level: ${productionCombination.filters.skillLevel}${
        productionCombination.filters.inventoryLimit !== undefined
          ? `, evolutions: ${
              (productionCombination.filters.inventoryLimit -
                productionCombination.production.pokemonCombination.pokemon.carrySize) /
              5
            }`
          : ''
      }\n` +
      `Subskills: ${filters.subskills && filters.subskills.size > 0 ? [...filters.subskills].join(', ') : 'None'}\n`;

    const teamInput: string[] = [];
    if (filters.ribbon > 0) {
      teamInput.push(`Ribbon level: ${filters.ribbon}`);
    }
    if (filters.e4eProcs > 0) {
      teamInput.push(`E4E: ${filters.e4eProcs} x ${mainskill.ENERGY_FOR_EVERYONE.amount(filters.e4eLevel)} energy`);
    }
    if (filters.helperBoostProcs > 0) {
      teamInput.push(
        `Helper boost: ${filters.helperBoostProcs} x ${
          mainskill.HELPER_BOOST.amount(filters.helperBoostLevel) +
          calculateHelperBoostHelpsFromUnique(filters.helperBoostUnique, filters.helperBoostLevel)
        } helps`
      );
    }
    if (filters.helpingBonus > 0) {
      teamInput.push(`Helping bonus: ${filters.helpingBonus}`);
    }
    if (filters.camp) {
      teamInput.push(`Good camp: ${filters.camp}`);
    }
    prettyString += teamInput.join(', ');
    if (teamInput.length > 0) {
      prettyString += '\n';
    }

    prettyString += `-------------\n`;
    return prettyString;
  }

  #prettifyProductionDetails(productionCombination: ProductionCombination) {
    const pokemonCombination = productionCombination.production;
    const summary = productionCombination.summary;

    let prettyString = `👨🏻‍🍳 Production Calculator 👨🏻‍🍳\nhttps://sleepapi.net\n\n${
      pokemonCombination.pokemonCombination.pokemon.name
    }(${shortPrettifyIngredientDrop(pokemonCombination.pokemonCombination.ingredientList)})\n`;

    prettyString += this.#prettifyFiltersDetails(productionCombination);

    prettyString += `Estimated skill procs per day: ${MathUtils.round(
      pokemonCombination.detailedProduce.averageTotalSkillProcs,
      1
    )}\n`;

    // skill values
    const {
      skillEnergySelfValue,
      skillEnergyOthersValue,
      skillProduceValue,
      skillBerriesOtherValue,
      skillStrengthValue,
      skillDreamShardValue,
      skillPotSizeValue,
      skillHelpsValue,
      skillTastyChanceValue
    } = summary;
    const prettifiedSkillProduce: string[] = [];
    if (skillProduceValue.berries.length > 0) {
      prettifiedSkillProduce.push(prettifyBerries(skillProduceValue.berries));
    }
    if (skillProduceValue.ingredients.length > 0) {
      prettifiedSkillProduce.push(
        `${prettifyIngredientDrop(
          skillProduceValue.ingredients.map(({ amount, ingredient }) => ({
            amount: MathUtils.round(amount, 1),
            ingredient
          }))
        )}`
      );
    }
    prettyString +=
      (skillEnergySelfValue > 0
        ? `Energy self skill value: ${MathUtils.round(skillEnergySelfValue, 2)} energy\n`
        : '') +
      (skillEnergyOthersValue > 0
        ? `Energy team skill value: ${MathUtils.round(skillEnergyOthersValue, 2)} energy / member\n`
        : '') +
      (skillBerriesOtherValue > 0
        ? `Berries team skill value: ${MathUtils.round(skillBerriesOtherValue, 1)} berries / member\n`
        : '') +
      (skillHelpsValue > 0 ? `Helps team skill value: ${MathUtils.round(skillHelpsValue, 2)} helps / member\n` : '') +
      (skillStrengthValue > 0 ? `Strength skill value: ${Math.floor(skillStrengthValue)} strength\n` : '') +
      (skillDreamShardValue > 0 ? `Dream shards skill value: ${Math.floor(skillDreamShardValue)} shards\n` : '') +
      (skillPotSizeValue > 0 ? `Pot size skill value: ${MathUtils.round(skillPotSizeValue, 2)} pot size\n` : '') +
      (skillTastyChanceValue > 0
        ? `Tasty chance skill value: ${MathUtils.round(skillTastyChanceValue, 2)}% crit chance\n`
        : '') +
      (prettifiedSkillProduce.length > 0 ? `Produce skill value: ${prettifiedSkillProduce.join(' + ')}\n` : '');

    prettyString += `Total berry output per day: ${MathUtils.round(
      pokemonCombination.detailedProduce.produce.berries[0]?.amount ?? 0,
      1
    )} ${pokemonCombination.detailedProduce.produce.berries[0]?.berry.name}\n`;

    const maybeSpilledIngredients =
      pokemonCombination.detailedProduce.spilledIngredients.length > 0
        ? prettifyIngredientDrop(pokemonCombination.detailedProduce.spilledIngredients)
        : 'None';
    prettyString += `Spilled ingredients at night: ${maybeSpilledIngredients}\n\n`;

    prettyString += `Total ingredient output per meal window\n${prettifyIngredientDrop(
      pokemonCombination.detailedProduce.produce.ingredients
    )}`;

    return prettyString;
  }

  #filterOnlyBest(
    tiersWithPokemonDetails: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[]
  ) {
    const seen = new Set<string>();
    const filtered: Map<string, { pokemon: string; ingredientList: string; diff?: number; details: string }[]> =
      new Map();
    for (const tier of tiersWithPokemonDetails) {
      for (const pokemon of tier.pokemonWithDetails) {
        if (!seen.has(pokemon.pokemon)) {
          seen.add(pokemon.pokemon);

          if (!filtered.has(tier.tier)) {
            filtered.set(tier.tier, [pokemon]);
          } else {
            const array = filtered.get(tier.tier);
            if (array !== undefined) {
              array.push(pokemon);
            }
          }
        }
      }
    }
    const filteredArray: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[] = [];
    for (const [tier, pokemonWithDetails] of filtered) {
      filteredArray.push({ tier, pokemonWithDetails });
    }

    return filteredArray;
  }

  #prettifyInput(details: SetCoverPokemonStats) {
    let prettyString = '\n-------------\n';

    prettyString += `Level: ${details.level}` + `, Nature: ${details.nature?.prettyName ?? 'None'}` + '\n';
    prettyString += `Subskills: ${details.subskills ? Array.from(details.subskills).join(', ') : 'None'}\n`;

    const teamInput: string[] = [];
    if (details.ribbon > 0) {
      teamInput.push(`Ribbon level: ${details.ribbon}`);
    }

    if (details.camp) {
      teamInput.push(`Good camp: ${details.camp}`);
    }
    prettyString += teamInput.join(', ');
    if (teamInput.length > 0) {
      prettyString += '\n';
    }
    prettyString += `-------------\n`;

    return prettyString;
  }

  #prettifyFillersForRecipe(recipe: IngredientSet[], surplus: SurplusIngredients): string {
    const fillers = flatToIngredientSet(surplus.relevant).map((filler) => {
      const recipeIngredient = recipe.find((r) => r.ingredient.name === filler.ingredient.name);
      const percentage = recipeIngredient ? (filler.amount / recipeIngredient.amount) * 100 : 0;
      return `${MathUtils.round(filler.amount, 1)} ${filler.ingredient} (${MathUtils.round(percentage, 0)}%)`;
    });

    fillers.push(
      `${flatToIngredientSet(surplus.extra)
        .map((filler) => `${MathUtils.round(filler.amount, 1)} ${filler.ingredient} (N/A)`)
        .join(', ')}`
    );

    return fillers.join(', ');
  }
}

export const WebsiteConverterService = new WebsiteConverterServiceImpl();
