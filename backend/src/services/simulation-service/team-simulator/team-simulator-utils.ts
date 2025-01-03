import { calculateHelpSpeedBeforeEnergy } from '@src/services/calculator/help/help-calculator.js';
import { calculateAveragePokemonIngredientSet } from '@src/services/calculator/ingredient/ingredient-calculate.js';
import type { Berry, ProduceFlat, TeamMemberExt, TeamSettingsExt } from 'sleepapi-common';
import {
  berrySetToFlat,
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage,
  ingredientSetToIntFlat
} from 'sleepapi-common';

class TeamSimulatorUtilsImpl {
  public calculateSkillPercentage(member: TeamMemberExt) {
    return calculateSkillPercentage(
      member.pokemonWithIngredients.pokemon.skillPercentage,
      member.settings.subskills,
      member.settings.nature
    );
  }

  public calculateIngredientPercentage(member: TeamMemberExt) {
    return calculateIngredientPercentage({
      pokemon: member.pokemonWithIngredients.pokemon,
      nature: member.settings.nature,
      subskills: member.settings.subskills
    });
  }

  // TEST
  // TEST should test that ingredientList is limited to level
  public calculateAverageProduce(member: TeamMemberExt): ProduceFlat {
    const ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);
    const pokemonIngredientListFlat = ingredientSetToIntFlat(member.pokemonWithIngredients.ingredientList);

    const avgIngredientList = calculateAveragePokemonIngredientSet(pokemonIngredientListFlat, member.settings.level);

    const memberBerryInList = berrySetToFlat([
      { amount: 1, berry: member.pokemonWithIngredients.pokemon.berry, level: member.settings.level }
    ]);
    const berriesPerDrop = calculateNrOfBerriesPerDrop(
      member.pokemonWithIngredients.pokemon.specialty,
      member.settings.subskills
    );

    return {
      berries: Float32Array.from(memberBerryInList, (value) => value * (berriesPerDrop * (1 - ingredientPercentage))),
      ingredients: Float32Array.from(avgIngredientList, (value) => value * ingredientPercentage)
    };
  }

  public calculateHelpSpeedBeforeEnergy(params: {
    member: TeamMemberExt;
    settings: TeamSettingsExt;
    helpingBonus: number;
  }) {
    const { member, settings, helpingBonus } = params;

    return calculateHelpSpeedBeforeEnergy({
      pokemon: member.pokemonWithIngredients.pokemon,
      level: member.settings.level,
      nature: member.settings.nature,
      subskills: member.settings.subskills,
      camp: settings.camp,
      ribbonLevel: member.settings.ribbon,
      helpingBonus
    });
  }

  public countMembersWithSubskill(team: TeamMemberExt[], subskill: string): number {
    let count = 0;
    for (const member of team) {
      if (member.settings.subskills.has(subskill)) {
        count++;
      }
    }
    return count;
  }

  public uniqueMembersWithBerry(params: { berry: Berry; members: TeamMemberExt[] }) {
    const { berry, members } = params;
    const { count } = members.reduce(
      (accumulator, cur) => {
        if (
          cur.pokemonWithIngredients.pokemon.berry === berry &&
          !accumulator.names.has(cur.pokemonWithIngredients.pokemon.name)
        ) {
          accumulator.names.add(cur.pokemonWithIngredients.pokemon.name);
          accumulator.count += 1;
        }
        return accumulator;
      },
      { count: 0, names: new Set<string>() }
    );
    return count;
  }
}

export const TeamSimulatorUtils = new TeamSimulatorUtilsImpl();
