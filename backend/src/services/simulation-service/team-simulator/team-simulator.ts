/**
 * Copyright 2025 Neroli's Lab Authors
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

import type { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import type {
  SkillActivation,
  TeamActivationValue,
  UnitActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type { MainskillTargeting } from 'sleepapi-common';
import {
  commonMocks,
  type CalculateTeamResponse,
  type FunctionalEvent,
  type MemberProductionBase,
  type SimpleTeamResult,
  type TeamMemberExt,
  type TeamSettingsExt
} from 'sleepapi-common';

export class TeamSimulator {
  private readonly simulationTickMinutes = 5;
  private run = 0;
  private rng: PreGeneratedRandom;

  private memberStates: MemberState[] = [];
  private memberStatesWithoutFillers: MemberState[] = [];
  private activeMemberStates: MemberState[] = [];
  private cookingState?: CookingState = undefined;
  private expertModeEvent?: FunctionalEvent;
  private settings: TeamSettingsExt;
  private scheduledMembersBySlot = new Map<number, Array<{ externalId: string; startMinutes: number }>>();
  private scheduledShiftTickOffsets = new Set<number>();

  private nightStartMinutes: number;
  private mealTimeMinutesSinceStart: number[];
  private cookedMealsCounter = 0;
  private fullDayDuration = 1440;
  private energyDegradeCounter = -1; // -1 so it takes 3 iterations and first degrade is after 10 minutes, then 10 minutes between each

  constructor(params: {
    settings: TeamSettingsExt;
    members: TeamMemberExt[];
    cookingState?: CookingState;
    iterations: number;
    rng?: PreGeneratedRandom;
  }) {
    const { settings, members, cookingState, iterations, rng } = params;

    // Initialize with pre-generated random numbers if not provided
    this.rng = rng || createPreGeneratedRandom();
    this.settings = settings;
    for (const shift of settings.schedule ?? []) {
      const [hour, minute] = shift.startTime.split(':').map(Number);
      const startMinutes = hour * 60 + minute;
      if (!Number.isInteger(startMinutes) || startMinutes < 0 || startMinutes >= this.fullDayDuration) continue;
      const slot = this.scheduledMembersBySlot.get(shift.slotIndex) ?? [];
      slot.push({ externalId: shift.externalId, startMinutes });
      this.scheduledMembersBySlot.set(shift.slotIndex, slot);
      const relativeStart =
        (startMinutes - (settings.wakeup.hour * 60 + settings.wakeup.minute) + this.fullDayDuration) %
        this.fullDayDuration;
      const tickOffset = Math.ceil(relativeStart / 5) * 5;
      this.scheduledShiftTickOffsets.add(tickOffset);
      // The simulation includes the final 1440-minute tick. A shift at wake-up
      // must also be applied there so the next simulated day starts with the
      // correct active roster and no overdue-help backlog.
      if (tickOffset === 0) this.scheduledShiftTickOffsets.add(this.fullDayDuration);
    }
    for (const shifts of this.scheduledMembersBySlot.values()) {
      shifts.sort((a, b) => a.startMinutes - b.startMinutes);
    }

    this.cookingState = cookingState;

    const { nightStartMinutes, mealTimeMinutesSinceStart } = TeamSimulatorUtils.setupSimulationTimes({
      settings,
      cookingState: this.cookingState
    });
    this.nightStartMinutes = nightStartMinutes;
    this.mealTimeMinutesSinceStart = mealTimeMinutesSinceStart;

    const expertModeSettings = settings.island?.expertMode;
    this.expertModeEvent = expertModeSettings ? settings.island?.bonuses(expertModeSettings) : undefined;
    const preparedMembers = TeamSimulatorUtils.prepareMembers({
      members,
      event: this.expertModeEvent
    });

    for (const member of preparedMembers) {
      const memberState = new MemberState({
        member,
        team: preparedMembers,
        settings,
        cookingState: this.cookingState,
        iterations,
        rng: this.rng
      });
      this.memberStates.push(memberState);
      if (!member.pokemonWithIngredients.pokemon.skill.is(commonMocks.mockMainskill)) {
        this.memberStatesWithoutFillers.push(memberState);
      }
    }
    this.memberStates.forEach((memberState, _, allMembers) => {
      memberState.otherMembers = allMembers.filter((other) => other.id !== memberState.id);
    });
  }

  public simulate() {
    this.updateActiveMembers(0);
    this.init();

    let minutesSinceWakeup = 0;
    // Day loop
    while (minutesSinceWakeup <= this.nightStartMinutes) {
      this.attemptCooking(minutesSinceWakeup);

      for (const member of this.activeMemberStates) {
        for (const skillActivation of member.attemptDayHelp(minutesSinceWakeup)) {
          this.maybeActivateTeamSkill(skillActivation, member);
        }
      }
      for (const member of this.activeMemberStates) {
        member.scheduleHelp(minutesSinceWakeup);
      }

      this.maybeDegradeEnergy();
      this.updateActiveMembers(minutesSinceWakeup);
      minutesSinceWakeup += this.simulationTickMinutes;
    }

    this.collectInventory();

    // Night loop
    while (minutesSinceWakeup <= this.fullDayDuration) {
      for (const member of this.activeMemberStates) {
        member.attemptNightHelp(minutesSinceWakeup);
      }

      this.maybeDegradeEnergy();
      this.updateActiveMembers(minutesSinceWakeup);
      minutesSinceWakeup += this.simulationTickMinutes;
    }
  }

  public results(): CalculateTeamResponse {
    this.collectInventory();

    const members = this.memberStatesWithoutFillers.map((m) => m.results(this.run));
    let cooking = undefined;
    if (this.cookingState) {
      cooking = this.cookingState.results(this.run);
    }

    return { members, cooking };
  }

  public ivResults(variantId: string): MemberProductionBase {
    this.collectInventory();

    const variant = this.memberStatesWithoutFillers.filter((member) => variantId === member.id);
    if (variant.length !== 1) {
      throw new Error('Team must contain exactly 1 variant');
    }

    return variant[0].ivResults(this.run);
  }

  public simpleResults(): SimpleTeamResult[] {
    this.collectInventory();

    return this.memberStatesWithoutFillers.map((member) => member.simpleResults(this.run));
  }

  private init() {
    this.startDay();

    for (const member of this.activeMemberStates) {
      for (const proc of member.collectInventory()) {
        this.maybeActivateTeamSkill(proc, member);
      }
    }

    this.energyDegradeCounter = -1;
    this.cookedMealsCounter = 0;
  }

  private startDay() {
    this.run++;
    if (this.cookingState && this.run % 7 === 1) {
      this.cookingState?.startNewWeek();
    }

    for (const member of this.memberStates) {
      member.wakeUp(this.activeMemberStates.includes(member));
    }
  }

  private attemptCooking(currentMinutesSincePeriodStart: number) {
    if (currentMinutesSincePeriodStart >= this.mealTimeMinutesSinceStart[this.cookedMealsCounter]) {
      for (const member of this.activeMemberStates) {
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

  private maybeActivateTeamSkill(result: SkillActivation, invoker: MemberState, recursionDepth: number = 0) {
    const teamActivations = result.activations.filter((activation) => activation.team);

    if (result.targeting === undefined) {
      // The team activations effect the whole team, like Energy For Everyone and Helper Boost
      for (const activation of teamActivations) {
        this.processFullTeamActivation(activation, invoker, recursionDepth);
      }
    } else {
      // The team activations target certain members, like Energizing Cheer and Extra Helpful

      // Currently, all skills that do multiple things to targeted mons target the same mons for each of these things.
      // E.g. Nuzzle restores energy to the same mon that gets the bonus skill helps
      // That's why one method takes all of them, whereas the full team activations can be handled independently.
      this.processTargetedActivation(teamActivations, result.targeting, invoker, recursionDepth);
    }
  }

  private processFullTeamActivation(activation: UnitActivation, invoker: MemberState, recursionDepth: number) {
    if (activation.team === undefined) {
      return;
    }
    if (activation.unit === 'helps') {
      this.processTeamHelpActivation(activation, invoker, this.activeMemberStates);
    }
    if (activation.unit === 'skill helps') {
      this.processTeamSkillHelpActivation(activation, invoker, this.activeMemberStates, recursionDepth);
    }
    if (activation.unit === 'energy') {
      this.processTeamEnergyActivation(activation, invoker, this.activeMemberStates);
    }
  }

  private processTargetedActivation(
    activations: UnitActivation[],
    targeting: MainskillTargeting,
    invoker: MemberState,
    recursionDepth: number
  ) {
    const { chanceToTargetLowestMembers, numMonsTargeted } = targeting;
    const teamActivations = activations.filter((activation) => activation.team);
    if (teamActivations.length === 0) {
      return;
    }
    const targetGroup: MemberState[] = this.findTargetGroup(numMonsTargeted, chanceToTargetLowestMembers);

    for (const activation of teamActivations) {
      if (activation.unit === 'helps') {
        this.processTeamHelpActivation(activation, invoker, targetGroup);
      }
      if (activation.unit === 'skill helps') {
        this.processTeamSkillHelpActivation(activation, invoker, targetGroup, recursionDepth);
      }
      if (activation.unit === 'energy') {
        this.processTeamEnergyActivation(activation, invoker, targetGroup);
      }
    }
  }

  private findTargetGroup(numMonsTargeted?: number, chanceToTargetLowestMembers?: number): MemberState[] {
    const copyOfMemberStates = this.activeMemberStates.slice();
    const shuffledMembers = copyOfMemberStates
      .map((member) => {
        return {
          member,
          randVal: this.rng()
        };
      })
      .sort((a, b) => a.randVal - b.randVal)
      .map((member) => member.member);
    const sortedMembers = shuffledMembers.sort((a, b) => a.energy - b.energy);

    const useLowestMembers = chanceToTargetLowestMembers !== undefined && this.rng() < chanceToTargetLowestMembers;
    return (useLowestMembers ? shuffledMembers : sortedMembers).slice(0, numMonsTargeted ?? 5);
  }

  private processTeamHelpActivation(activation: UnitActivation, invoker: MemberState, membersHelped: MemberState[]) {
    if (activation.unit !== 'helps' || activation.team === undefined) {
      return;
    }
    for (const member of membersHelped) {
      member.addHelpsFromSkill(activation.team, invoker);
      invoker.addSkillValue(activation.team);
    }
  }

  private processTeamSkillHelpActivation(
    activation: UnitActivation,
    invoker: MemberState,
    membersHelped: MemberState[],
    recursionDepth: number
  ) {
    if (activation.unit !== 'skill helps' || activation.team === undefined) {
      return;
    }
    for (const member of membersHelped) {
      const bonusActivations: SkillActivation[] = member.addSkillHelps(activation.team);
      invoker.addSkillValue({ regular: bonusActivations.length, crit: 0 });
      if (recursionDepth < 10) {
        // In theory, a team of all Togedemaru could keep giving each other bonus activations.
        // The odds are very slim, so I'm making the simulation slightly less accurate in order to avoid potential infinite recursion.
        for (const bonusActivation of bonusActivations) {
          this.maybeActivateTeamSkill(bonusActivation, member, recursionDepth + 1);
        }
      }
    }
  }

  private processTeamEnergyActivation(activation: UnitActivation, invoker: MemberState, membersHelped: MemberState[]) {
    if (activation.unit !== 'energy' || activation.team === undefined) {
      return;
    }
    const recovered = this.recoverMemberEnergy(activation.team, invoker, membersHelped);
    invoker.addSkillValue({ regular: recovered.regular.skillValue, crit: recovered.crit.skillValue });
  }

  private recoverMemberEnergy(activation: TeamActivationValue, invoker: MemberState, targetGroup: MemberState[]) {
    const { crit, regular } = activation;
    let valueRegular = 0;
    let valueCrit = 0;
    let wastedRegular = 0;
    let wastedCrit = 0;

    if (regular + crit > 0) {
      for (const mem of targetGroup) {
        const { recovered: regularRecovered, wasted: regularWasted } = mem.recoverEnergy(regular, invoker);
        const { recovered: critRecovered, wasted: critWasted } = mem.recoverEnergy(crit, invoker);
        wastedRegular += regularWasted;
        wastedCrit += critWasted;
        valueRegular += regularRecovered;
        valueCrit += critRecovered;
      }
    }

    return {
      regular: { wastedEnergy: wastedRegular, skillValue: valueRegular },
      crit: { wastedEnergy: wastedCrit, skillValue: valueCrit },
      targetGroup
    };
  }

  private collectInventory() {
    for (const member of this.activeMemberStates) {
      for (const activation of member.collectInventory()) {
        this.maybeActivateTeamSkill(activation, member);
      }
    }
  }

  /** Applies scheduled swaps only after the current five-minute tick has fully resolved. */
  private updateActiveMembers(minutesSinceWakeup: number) {
    if (this.scheduledMembersBySlot.size === 0) {
      if (this.activeMemberStates.length === 0) this.setActiveMembers(this.memberStatesWithoutFillers);
      return;
    }
    const wakeup = this.settings.wakeup;
    const currentMinutes =
      ((wakeup.hour * 60 + wakeup.minute + minutesSinceWakeup) % this.fullDayDuration + this.fullDayDuration) %
      this.fullDayDuration;
    // The active team cannot change between scheduled start times. This avoids
    // rebuilding team relationships and helping-speed data on every tick.
    if (this.activeMemberStates.length > 0 && !this.scheduledShiftTickOffsets.has(minutesSinceWakeup)) return;

    const ids = new Set<string>();
    for (const shifts of this.scheduledMembersBySlot.values()) {
      let current = shifts.at(-1);
      for (const shift of shifts) {
        if (shift.startMinutes > currentMinutes) break;
        current = shift;
      }
      if (current) ids.add(current.externalId);
    }
    const next = this.memberStatesWithoutFillers.filter((member) => ids.has(member.id));
    if (
      next.length === this.activeMemberStates.length &&
      next.every((member, index) => member === this.activeMemberStates[index])
    ) {
      return;
    }
    const wasInitialized = this.activeMemberStates.length > 0;
    const departing = this.activeMemberStates.filter((member) => !next.includes(member));
    const incoming = next.filter((member) => !this.activeMemberStates.includes(member));
    for (const member of departing) {
      for (const proc of member.collectInventory()) this.maybeActivateTeamSkill(proc, member);
    }
    this.setActiveMembers(next);
    // Do not allow a member to bank the helps elapsed while it was rotated out.
    // The initial roster is prepared by wakeUp(), which intentionally starts at zero.
    if (wasInitialized) {
      for (const member of incoming) member.resetHelpTimer(minutesSinceWakeup);
    }
  }

  private setActiveMembers(members: MemberState[]) {
    this.activeMemberStates = members;
    const team = members.map((member) => member.member);
    for (const member of members) {
      member.setTeam(team);
      member.otherMembers = members.filter((other) => other.id !== member.id);
    }
  }
}
