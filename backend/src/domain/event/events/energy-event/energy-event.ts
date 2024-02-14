import { Time } from '@src/domain/time/time';
import { energyFactorFromEnergy } from '@src/services/calculator/energy/energy-calculator';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { prettifyTime } from '@src/utils/time-utils/time-utils';
import { EventType, ScheduledEvent } from '../../event';

export class EnergyEvent extends ScheduledEvent {
  time: Time;
  type: EventType = 'energy';
  description: string;

  delta: number;
  before?: number;
  after?: number;

  constructor(params: { time: Time; description: string; delta: number; before?: number }) {
    const { time, description, delta, before } = params;
    super();

    this.time = time;
    this.description = description;

    this.delta = roundDown(delta, 2);
    this.before = before !== undefined ? roundDown(before, 2) : undefined;
    this.after = before !== undefined ? roundDown(before + delta, 2) : undefined;
  }

  format(): string {
    const deltaSigned = `${this.delta > 0 ? '+' : ''}${this.delta}%`;

    if (this.before !== undefined && this.after !== undefined) {
      return (
        `[${prettifyTime(this.time)}][Energy] (${this.description}): Recovery: ${deltaSigned}, ` +
        `Energy: ${this.before}% -> ${this.after}%, Energy coefficient: ${energyFactorFromEnergy(this.after)}`
      );
    } else {
      return `[${prettifyTime(this.time)}][Energy] (${this.description}): ${deltaSigned}`;
    }
  }
}
