import { calculateHelpSpeedBeforeEnergy } from '@src/services/calculator/help/help-calculator.js';
import {
  Berry,
  calculateIngredientPercentage,
  calculateSkillPercentage,
  TeamMemberExt,
  TeamSettingsExt
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
