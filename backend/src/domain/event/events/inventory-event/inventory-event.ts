import { Produce } from '@src/domain/combination/produce';
import { Time } from '@src/domain/time/time';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { prettifyIngredientDrop } from '@src/utils/json/json-utils';
import { prettifyTime } from '@src/utils/time-utils/time-utils';
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

    this.delta = roundDown(delta, 2);
    this.before = roundDown(before, 2);
    this.after = roundDown(this.before + delta, 2);
    this.max = max;

    this.contents = contents;
  }

  format(): string {
    const deltaSigned = `${this.delta >= 0 ? '+' : ''}${this.delta}`;
    const filled =
      this.max && `${this.after}/${this.max} (${Math.max(roundDown(100 * (this.after / this.max), 2), 0)}%)`;

    const berries = this.contents.berries;
    const ings = this.contents.ingredients;
    const prettifiedProduce = `${roundDown(berries.amount, 2)} ${berries.berry.name} ${
      ings.length > 0 ? `+ ${prettifyIngredientDrop(ings)}` : ''
    }`;

    let str =
      `[${prettifyTime(this.time)}][Inventory] (${this.description}): ` +
      `${this.before} -> ${this.after} (${deltaSigned})`;

    if (this.max) {
      str += `, filled: ${filled}`;
    }

    str += `, current contents: ${prettifiedProduce}`;
    return str;
  }
}
