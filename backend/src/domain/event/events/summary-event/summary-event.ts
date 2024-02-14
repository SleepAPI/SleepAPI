import { Produce } from '@src/domain/combination/produce';
import { Time } from '@src/domain/time/time';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { prettifyIngredientDrop } from '@src/utils/json/json-utils';
import { prettifyTime } from '@src/utils/time-utils/time-utils';
import { IngredientSet } from 'sleepapi-common';
import { EventType, ScheduledEvent } from '../../event';

export interface Summary {
  nrOfHelps: number;
  helpsBeforeSS: number;
  helpsAfterSS: number;

  totalProduce: Produce;

  averageEnergy: number;
  averageFrequency: number;

  spilledIngredients: IngredientSet[];

  collectFrequency?: Time;

  totalRecovery: number;
}

export class SummaryEvent extends ScheduledEvent {
  time: Time;
  type: EventType = 'info';
  description: string;

  summary: Summary;

  constructor(params: { time: Time; description: string; summary: Summary }) {
    const { time, description, summary } = params;
    super();

    this.time = time;
    this.description = description;

    this.summary = summary;
  }

  format(): string {
    const {
      nrOfHelps,
      helpsBeforeSS,
      helpsAfterSS,
      totalProduce,
      averageEnergy,
      averageFrequency,
      spilledIngredients,
      collectFrequency,
      totalRecovery,
    } = this.summary;
    const prettifiedProduce = `${roundDown(totalProduce.berries.amount, 2)} ${totalProduce.berries.berry.name} ${
      totalProduce.ingredients.length > 0 ? `+ ${prettifyIngredientDrop(totalProduce.ingredients)}` : ''
    }`;

    const spilledProduce = `${spilledIngredients.length > 0 ? `${prettifyIngredientDrop(spilledIngredients)}` : ''}`;

    return (
      `-----\n` +
      `[${prettifyTime(this.time)}][${this.description}]\n` +
      `Total produce: ${prettifiedProduce}\n` +
      `Spilled produce: ${spilledProduce}\n` +
      `Total helps: ${nrOfHelps}\n` +
      `Helps before sneaky snacking: ${helpsBeforeSS}\n` +
      `Helps spent sneaky snacking: ${helpsAfterSS}\n` +
      `Average time before full inventory: ${
        collectFrequency ? `${prettifyTime(collectFrequency)} (hh:mm:ss)` : 'never'
      }\n` +
      `Average energy: ${roundDown(averageEnergy, 1)}%\n` +
      `Average frequency: ${Math.floor(averageFrequency)}\n` +
      `Total recovery: ${totalRecovery}\n`
    );
  }
}
