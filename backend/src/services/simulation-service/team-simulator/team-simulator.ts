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

import { TeamMember, TeamSettings } from '@src/domain/combination/team';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state';
import { MemberState, SkillActivation } from '@src/services/simulation-service/team-simulator/member-state';
import { getDefaultMealTimes } from '@src/utils/meal-utils/meal-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { CalculateTeamResponse, Time, TimePeriod } from 'sleepapi-common';

export class TeamSimulator {
  private run = 0;

  private memberStates: MemberState[] = [];
  private cookingState;

  private currentTimeIndex = 0;
  private timeIntervals: Time[] = [];
  private dayPeriod: TimePeriod;
  private nightPeriod: TimePeriod;
  private mealTimes: Time[];
  private cookedMealsCounter = 0;
  private chunksOf5Minutes = 0;

  constructor(params: { settings: TeamSettings; members: TeamMember[] }) {
    const { settings, members } = params;

    this.cookingState = new CookingState(settings.camp);

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

    this.mealTimes = getDefaultMealTimes(dayPeriod);

    for (const member of members) {
      const memberState = new MemberState({ member, team: members, settings, cookingState: this.cookingState });
      this.memberStates.push(memberState);
    }
  }

  public simulate() {
    this.init();

    while (this.daytime()) {
      this.attemptCooking();

      for (const member of this.memberStates) {
        const teamSkillActivated = member.attemptDayHelp(this.#currentTime);
        if (teamSkillActivated) {
          this.activateTeamSkill(teamSkillActivated);
        }
      }

      this.maybeDegradeEnergy();

      this.currentTimeIndex += 1;
    }

    this.collectInventory();

    while (this.nightTime()) {
      for (const member of this.memberStates) {
        member.attemptNightHelp(this.#currentTime);
      }

      if (this.chunksOf5Minutes++ % 2 === 0 && this.chunksOf5Minutes >= 2) {
        for (const member of this.memberStates) {
          member.degradeEnergy();
        }
      }

      this.currentTimeIndex += 1;
    }
  }

  public results(): CalculateTeamResponse {
    this.collectInventory();

    const cookingResult = this.cookingState.results(this.run);

    return { members: this.memberStates.map((m) => m.averageResults(this.run)), cooking: cookingResult };
  }

  private init() {
    for (const member of this.memberStates) {
      const morningSkills = member.startDay();
      for (const proc of morningSkills) {
        this.activateTeamSkill(proc);
      }
    }

    this.currentTimeIndex = 0;
    this.cookedMealsCounter = 0;
    this.chunksOf5Minutes = 0;
    this.run++;
  }

  get #currentTime() {
    return this.timeIntervals[this.currentTimeIndex];
  }

  private attemptCooking() {
    let mealIndex = this.cookedMealsCounter;

    for (; mealIndex < this.mealTimes.length; mealIndex++) {
      const mealTime = this.mealTimes[mealIndex];
      if (
        TimeUtils.isAfterOrEqualWithinPeriod({
          currentTime: this.#currentTime,
          eventTime: mealTime,
          period: this.dayPeriod,
        })
      ) {
        for (const member of this.memberStates) {
          member.collectInventory();
          member.recoverMeal();
        }
        // mod 7 for if Sunday
        this.cookingState.cook(this.run % 7 === 0);
        this.cookedMealsCounter++;
      } else break;
    }
  }

  private maybeDegradeEnergy() {
    // degrade energy every 10 minutes, so every 2nd chunk of 5 minutes
    if (this.chunksOf5Minutes++ % 2 === 0 && this.chunksOf5Minutes >= 2) {
      for (const member of this.memberStates) {
        member.degradeEnergy();
      }
    }
  }

  private activateTeamSkill(result: SkillActivation) {
    for (const mem of this.memberStates) {
      mem.addHelps(result.helpsTeam);
      mem.recoverEnergy(result.energyTeam);
    }
  }

  private collectInventory() {
    for (const member of this.memberStates) {
      member.collectInventory();
    }
  }

  private daytime() {
    return TimeUtils.timeWithinPeriod(this.#currentTime, this.dayPeriod);
  }

  private nightTime() {
    return this.#currentTime && TimeUtils.timeWithinPeriod(this.#currentTime, this.nightPeriod);
  }
}
