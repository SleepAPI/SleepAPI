import { TimeUtils } from '@src/utils/time-utils/time-utils';
import type { Produce, Time } from 'sleepapi-common';
import { prettifyBerries, prettifyIngredientDrop } from 'sleepapi-common';
import type { EventType } from '../../event';
import { ScheduledEvent } from '../../event';

export class HelpEvent extends ScheduledEvent {
  time: Time;
  type: EventType = 'help';
  description: string;

  frequency: number;
  produce: Produce;
  nextHelp: Time;

  constructor(params: { time: Time; description: string; frequency: number; produce: Produce; nextHelp: Time }) {
    const { time, description, frequency, produce, nextHelp } = params;
    super();

    this.time = time;
    this.description = description;

    this.frequency = frequency;
    this.produce = produce;
    this.nextHelp = nextHelp;
  }

  format(): string {
    const berries = this.produce.berries;
    const ings = this.produce.ingredients;

    const prettifiedProduce = `${berries.length > 0 ? prettifyBerries(berries) : ''} ${
      ings.length > 0 ? `+ ${prettifyIngredientDrop(ings)}` : ''
    }`;
    return (
      `[${TimeUtils.prettifyTime(this.time)}][${this.description}] ` +
      `Frequency: ${Math.floor(this.frequency)}, ` +
      `produce: ${prettifiedProduce}, ` +
      `next help: ${TimeUtils.prettifyTime(this.nextHelp)}`
    );
  }
}
