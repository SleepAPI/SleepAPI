import { TeamMember, TeamSettings } from '@src/domain/combination/team';
import { calculateHelpSpeedBeforeEnergy } from '@src/services/calculator/help/help-calculator';
import {
  berry,
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage,
} from 'sleepapi-common';

class TeamSimulatorUtilsImpl {
  public calculateSkillPercentage(member: TeamMember) {
    return calculateSkillPercentage(member.pokemonSet.pokemon, member.subskills, member.nature);
  }

  public calculateIngredientPercentage(member: TeamMember) {
    return calculateIngredientPercentage({
      pokemon: member.pokemonSet.pokemon,
      nature: member.nature,
      subskills: member.subskills,
    });
  }

  public calculateNrOfBerriesPerDrop(member: TeamMember) {
    return calculateNrOfBerriesPerDrop(member.pokemonSet.pokemon, member.subskills);
  }

  public calculateHelpSpeedBeforeEnergy(params: { member: TeamMember; settings: TeamSettings; helpingBonus: number }) {
    const { member, settings, helpingBonus } = params;

    return calculateHelpSpeedBeforeEnergy({
      pokemon: member.pokemonSet.pokemon,
      level: member.level,
      nature: member.nature,
      subskills: member.subskills,
      camp: settings.camp,
      helpingBonus,
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
