/**
 * Copyright 2024 Sleep API Authors
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

import { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
import { SleepAPIError } from '@src/domain/error/sleepapi-error';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state';
import {
  MemberState,
  TeamSkillActivation,
  TeamSkillEnergy,
} from '@src/services/simulation-service/team-simulator/member-state';
import { getDefaultMealTimes } from '@src/utils/meal-utils/meal-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { CalculateTeamResponse, MemberProductionBase, RandomUtils, Time, TimePeriod } from 'sleepapi-common';

export class TeamSimulator {
  private run = 0;

  private memberStates: MemberState[] = [];
  private cookingState?: CookingState = undefined;

  private timeIntervals: Time[] = [];
  private dayPeriod: TimePeriod;
  private nightPeriod: TimePeriod;
  private nightStartMinutes: number;
  private mealTimes: number[];
  private cookedMealsCounter = 0;
  private fullDayDuration = 1440;
  private energyDegradeCounter = -1; // -1 so it takes 3 iterations and first degrade is after 10 minutes, then 10 minutes between each

  constructor(params: { settings: TeamSettingsExt; members: TeamMember[]; includeCooking: boolean }) {
    const { settings, members, includeCooking } = params;

    if (includeCooking) {
      this.cookingState = new CookingState(settings.camp);
    }

    const dayPeriod = {
      start: settings.wakeup,
      end: settings.bedtime,
    };
    this.dayPeriod = dayPeriod;
    const nightPeriod = {
      start: settings.bedtime,
      end: settings.wakeup,
    };
    this.nightPeriod = nightPeriod;

    let next5Minutes = settings.wakeup;
    while (TimeUtils.timeWithinPeriod(next5Minutes, this.dayPeriod)) {
      this.timeIntervals.push(next5Minutes);
      next5Minutes = TimeUtils.addTime(next5Minutes, { hour: 0, minute: 5, second: 0 });
    }
    next5Minutes = settings.bedtime;
    while (TimeUtils.timeWithinPeriod(next5Minutes, this.nightPeriod)) {
      this.timeIntervals.push(next5Minutes);
      next5Minutes = TimeUtils.addTime(next5Minutes, { hour: 0, minute: 5, second: 0 });
    }

    this.nightStartMinutes = TimeUtils.timeToMinutesSinceStart(this.nightPeriod.start, this.dayPeriod.start);

    const mealTimes = getDefaultMealTimes(dayPeriod);
    this.mealTimes = mealTimes.map((time) => TimeUtils.timeToMinutesSinceStart(time, this.dayPeriod.start));

    for (const member of members) {
      const memberState = new MemberState({ member, team: members, settings, cookingState: this.cookingState });
      this.memberStates.push(memberState);
    }
  }

  public simulate() {
    this.init();

    let minutesSinceWakeup = 0;
    // Day loop
    while (minutesSinceWakeup <= this.nightStartMinutes) {
      this.attemptCooking(minutesSinceWakeup);

      for (const member of this.memberStates) {
        for (const teamSkillActivated of member.attemptDayHelp(minutesSinceWakeup)) {
          this.activateTeamSkill(teamSkillActivated, member);
        }
      }
      for (const member of this.memberStates) {
        member.scheduleHelp(minutesSinceWakeup);
      }

      this.maybeDegradeEnergy();
      minutesSinceWakeup += 5;
    }

    this.collectInventory();

    // Night loop
    while (minutesSinceWakeup <= this.fullDayDuration) {
      for (const member of this.memberStates) {
        member.attemptNightHelp(minutesSinceWakeup);
      }

      this.maybeDegradeEnergy();
      minutesSinceWakeup += 5;
    }
  }

  public results(): CalculateTeamResponse {
    this.collectInventory();

    const members = this.memberStates.map((m) => m.results(this.run));
    if (!this.cookingState) {
      throw new SleepAPIError('Cooking simulator was not instantiated');
    }
    const cooking = this.cookingState.results(this.run);

    return { members, cooking };
  }

  public ivResults(variantId: string): MemberProductionBase {
    this.collectInventory();

    const variant = this.memberStates.filter((member) => variantId === member.id);
    if (variant.length !== 1) {
      throw new Error('Team must contain exactly 1 variant');
    }

    return variant[0].ivResults(this.run);
  }

  private init() {
    for (const member of this.memberStates) {
      member.wakeUp();
    }

    for (const member of this.memberStates) {
      for (const proc of member.collectInventory()) {
        this.activateTeamSkill(proc, member);
      }
    }

    this.energyDegradeCounter = -1;
    this.cookedMealsCounter = 0;
    this.run++;
  }

  private attemptCooking(currentMinutesSincePeriodStart: number) {
    if (currentMinutesSincePeriodStart >= this.mealTimes[this.cookedMealsCounter]) {
      for (const member of this.memberStates) {
        member.updateIngredientBag();
        member.recoverMeal();
      }
      // mod 7 for if Sunday
      this.cookingState?.cook(this.run % 7 === 0);
      this.cookedMealsCounter++;
    }
  }

  private maybeDegradeEnergy() {
    // degrade energy every 10 minutes, so every 2nd chunk of 5 minutes
    if (++this.energyDegradeCounter >= 2) {
      this.energyDegradeCounter = 0;
      for (const member of this.memberStates) {
        member.degradeEnergy();
      }
    }
  }

  private activateTeamSkill(result: TeamSkillActivation, invoker: MemberState) {
    if (result.helps) {
      for (const mem of this.memberStates) {
        mem.addHelps(result.helps);
        // TODO: we currently don't track produce generated from helps
        invoker.addSkillValue(result.helps);
      }
    } else if (result.energy) {
      const regular = this.recoverMemberEnergy(result.energy.regular);
      const crit = this.recoverMemberEnergy(result.energy.crit);
      invoker.wasteEnergy(regular.wastedEnergy + crit.wastedEnergy);
      invoker.addSkillValue({ regular: regular.skillValue, crit: crit.skillValue });
    }
  }

  private recoverMemberEnergy(energy: TeamSkillEnergy) {
    const { amount, chanceTargetLowest, random } = energy;
    let skillValue = 0;
    let wastedEnergy = 0;

    if (amount > 0) {
      const targetGroup = random ? this.energyTargetMember(chanceTargetLowest) : this.memberStates;

      for (const mem of targetGroup) {
        const { recovered, wasted } = mem.recoverEnergy(amount);
        wastedEnergy += wasted;
        skillValue += recovered;
      }
    }

    return { wastedEnergy, skillValue };
  }

  /**
   * @returns array of size 1 containing the randomized member to target
   */
  private energyTargetMember(chanceTargetLowest: number): MemberState[] {
    const sortedMembers = [...this.memberStates].sort((a, b) => a.energy - b.energy);
    const lowestEnergy = sortedMembers[0]?.energy ?? 0;

    const lowestEnergyMembers = sortedMembers.filter((mem) => mem.energy === lowestEnergy);
    const allMembers = this.memberStates;

    const targetGroup = RandomUtils.roll(chanceTargetLowest) ? lowestEnergyMembers : allMembers;
    return [RandomUtils.randomElement(targetGroup)].filter((member): member is MemberState => member !== undefined);
  }

  private collectInventory() {
    for (const member of this.memberStates) {
      for (const activation of member.collectInventory()) {
        this.activateTeamSkill(activation, member);
      }
    }
  }
}
