import { Produce } from '@src/domain/combination/produce';
import { Time } from '@src/domain/time/time';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { MathUtils, mainskill } from 'sleepapi-common';
import { EventType, ScheduledEvent } from '../../event';

export interface SkillActivation {
  skill: mainskill.MainSkill;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  fractionOfProc: number;
  adjustedProduce?: Produce;
}

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
