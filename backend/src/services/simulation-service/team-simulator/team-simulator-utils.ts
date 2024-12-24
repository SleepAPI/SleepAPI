import type { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
import { calculateHelpSpeedBeforeEnergy } from '@src/services/calculator/help/help-calculator';
import type { berry } from 'sleepapi-common';
import {
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage,
  subskill
} from 'sleepapi-common';

class TeamSimulatorUtilsImpl {
  public calculateSkillPercentage(member: TeamMember) {
    return calculateSkillPercentage(member.pokemonSet.pokemon.skillPercentage, member.subskills, member.nature);
  }

  public calculateIngredientPercentage(member: TeamMember) {
    return calculateIngredientPercentage({
      pokemon: member.pokemonSet.pokemon,
      nature: member.nature,
      subskills: member.subskills
    });
  }

  public calculateNrOfBerriesPerDrop(member: TeamMember) {
    return calculateNrOfBerriesPerDrop(member.pokemonSet.pokemon, member.subskills);
  }

  public calculateHelpSpeedBeforeEnergy(params: {
    member: TeamMember;
    settings: TeamSettingsExt;
    helpingBonus: number;
  }) {
    const { member, settings, helpingBonus } = params;

    // all hb are already counted for team
    const subskillsWithoutHB = member.subskills.filter((s) => s.name !== subskill.HELPING_BONUS.name);

    return calculateHelpSpeedBeforeEnergy({
      pokemon: member.pokemonSet.pokemon,
      level: member.level,
      nature: member.nature,
      subskills: subskillsWithoutHB,
      camp: settings.camp,
      ribbonLevel: member.ribbon,
      helpingBonus
    });
  }

  public uniqueMembersWithBerry(params: { berry: berry.Berry; members: TeamMember[] }) {
    const { berry, members } = params;
    const { count } = members.reduce(
      (accumulator, cur) => {
        if (cur.pokemonSet.pokemon.berry === berry && !accumulator.names.has(cur.pokemonSet.pokemon.name)) {
          accumulator.names.add(cur.pokemonSet.pokemon.name);
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
