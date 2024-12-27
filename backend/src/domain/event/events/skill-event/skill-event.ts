import type { EventType } from '@src/domain/event/event.js';
import { ScheduledEvent } from '@src/domain/event/event.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { SkillActivation, Time } from 'sleepapi-common';
import { MathUtils } from 'sleepapi-common';

export class SkillEvent extends ScheduledEvent {
  time: Time;
  type: EventType = 'skill';
  description: string;

  skillActivation: SkillActivation;

  constructor(params: { time: Time; description: string; skillActivation: SkillActivation }) {
    const { time, description, skillActivation } = params;
    super();

    this.time = time;
    this.description = description;

    this.skillActivation = skillActivation;
  }

  format(): string {
    return `[${TimeUtils.prettifyTime(this.time)}][Skill] (${this.description}): ${MathUtils.round(
      this.skillActivation.adjustedAmount,
      2
    )} ${this.skillActivation.skill.unit} (${MathUtils.round(this.skillActivation.fractionOfProc * 100, 1)}% strength)`;
  }
}
