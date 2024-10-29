import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { MathUtils, Produce, Time, prettifyBerries, prettifyIngredientDrop } from 'sleepapi-common';
import { EventType, ScheduledEvent } from '../../event';

export class InventoryEvent extends ScheduledEvent {
  time: Time;
  type: EventType = 'inventory';
  description: string;

  delta: number;
  before: number;
  after: number;
  max?: number;
  contents: Produce;

  constructor(params: {
    time: Time;
    description: string;
    delta: number;
    before: number;
    contents: Produce;
    max?: number;
  }) {
    const { time, description, delta, before, max, contents } = params;
    super();

    this.time = time;
    this.description = description;

    this.delta = MathUtils.round(delta, 2);
    this.before = MathUtils.round(before, 2);
    this.after = MathUtils.round(this.before + delta, 2);
    this.max = max;

    this.contents = contents;
  }

  format(): string {
    const deltaSigned = `${this.delta >= 0 ? '+' : ''}${this.delta}`;
    const filled =
      this.max && `${this.after}/${this.max} (${Math.max(MathUtils.round(100 * (this.after / this.max), 2), 0)}%)`;

    const berries = this.contents.berries;
    const ings = this.contents.ingredients;
    const prettifiedProduce = `${berries.length > 0 ? prettifyBerries(berries) : ''} ${
      ings.length > 0 ? `+ ${prettifyIngredientDrop(ings)}` : ''
    }`;

    let str =
      `[${TimeUtils.prettifyTime(this.time)}][Inventory] (${this.description}): ` +
      `${this.before} -> ${this.after} (${deltaSigned})`;

    if (this.max) {
      str += `, filled: ${filled}`;
    }

    str += `, current contents: ${prettifiedProduce}`;
    return str;
  }
}
