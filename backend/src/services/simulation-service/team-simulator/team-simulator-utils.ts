import { calculateHelpSpeedBeforeEnergy } from '@src/services/calculator/help/help-calculator.js';
import type { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { getDefaultMealTimes, getMealWindows } from '@src/utils/meal-utils/meal-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { FunctionalEvent, MealSlot, ProduceFlat, TeamMemberExt, TeamSettingsExt, TimePeriod } from 'sleepapi-common';
import {
  berrySetToFlat,
  calculateAveragePokemonIngredientSet,
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage
} from 'sleepapi-common';

class TeamSimulatorUtilsImpl {
  public setupSimulationTimes(params: { settings: TeamSettingsExt; cookingState?: CookingState }): {
    nightStartMinutes: number;
    mealTimeMinutesSinceStart: number[];
    mealWindowsMinutesSinceStart: { meal: MealSlot; start: number; end: number }[];
  } {
    const { settings, cookingState } = params;

    const dayPeriod: TimePeriod = {
      start: settings.wakeup,
      end: settings.bedtime
    };

    const nightStartMinutes = TimeUtils.timeToMinutesSinceStart(settings.bedtime, settings.wakeup);

    const mealTimes = getDefaultMealTimes(dayPeriod);
    const mealWindows = getMealWindows(dayPeriod);
    cookingState?.setMealTimes(mealTimes.meals);
    const mealTimeMinutesSinceStart = mealTimes.sorted.map((time) =>
      TimeUtils.timeToMinutesSinceStart(time, dayPeriod.start)
    );

    return {
      nightStartMinutes,
      mealTimeMinutesSinceStart,
      mealWindowsMinutesSinceStart: mealWindows.map(({ meal, start, end }) => ({
        meal,
        start: TimeUtils.timeToMinutesSinceStart(start, dayPeriod.start),
        end: TimeUtils.timeToMinutesSinceStart(end, dayPeriod.start)
      }))
    };
  }

  public prepareMembers(params: { members: TeamMemberExt[]; event?: FunctionalEvent }): TeamMemberExt[] {
    const { members, event } = params;

    if (!event) {
      return members;
    }

    return members.map((member) => event.applyToTeam(member));
  }

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

  public calculateAverageProduce(member: TeamMemberExt): ProduceFlat {
    const ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);

    const avgIngredientList = calculateAveragePokemonIngredientSet(
      member.pokemonWithIngredients.ingredientList,
      member.settings.level
    );

    const memberBerryInList = berrySetToFlat([
      { amount: 1, berry: member.pokemonWithIngredients.pokemon.berry, level: member.settings.level }
    ]);
    const berriesPerDrop = calculateNrOfBerriesPerDrop(
      member.pokemonWithIngredients.pokemon,
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
    teamHelpingBonus: number;
  }) {
    const { member, settings, teamHelpingBonus } = params;

    return calculateHelpSpeedBeforeEnergy({
      pokemon: member.pokemonWithIngredients.pokemon,
      level: member.settings.level,
      nature: member.settings.nature,
      subskills: member.settings.subskills,
      camp: settings.camp,
      ribbonLevel: member.settings.ribbon,
      teamHelpingBonus
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
}

export const TeamSimulatorUtils = new TeamSimulatorUtilsImpl();
