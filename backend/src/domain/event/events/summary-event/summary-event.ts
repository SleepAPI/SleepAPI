import { Produce } from '@src/domain/combination/produce';
import { Time } from '@src/domain/time/time';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { prettifyIngredientDrop } from '@src/utils/json/json-utils';
import { prettifyTime } from '@src/utils/time-utils/time-utils';
import { IngredientSet, mainskill } from 'sleepapi-common';
import { EventType, ScheduledEvent } from '../../event';

export interface Summary {
  skill: mainskill.MainSkill;
  skillProcs: number;
  skillEnergySelfValue: number;
  skillEnergyOthersValue: number;
  skillProduceValue: Produce;
  skillStrengthValue: number;
  skillDreamShardValue: number;
  skillPotSizeValue: number;
  skillHelpsValue: number;
  skillTastyChanceValue: number;

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
      skill,
      skillProcs,
      skillEnergySelfValue,
      skillEnergyOthersValue,
      skillProduceValue,
      skillStrengthValue,
      skillDreamShardValue,
      skillPotSizeValue,
      skillHelpsValue,
      skillTastyChanceValue,
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

    const prettifiedSkillProduce: string[] = [];
    if (skillProduceValue.berries.amount > 0) {
      prettifiedSkillProduce.push(
        `${roundDown(skillProduceValue.berries.amount, 2)} ${skillProduceValue.berries.berry.name}`
      );
    }
    if (skillProduceValue.ingredients.length > 0) {
      prettifiedSkillProduce.push(
        `${prettifyIngredientDrop(
          skillProduceValue.ingredients.map(({ amount, ingredient }) => ({
            amount: roundDown(amount, 1),
            ingredient,
          }))
        )}`
      );
    }

    const spilledProduce = `${spilledIngredients.length > 0 ? `${prettifyIngredientDrop(spilledIngredients)}` : '-'}`;

    return (
      `-----\n` +
      `[${prettifyTime(this.time)}][${this.description}]\n` +
      `Total produce: ${prettifiedProduce}\n` +
      `Spilled produce: ${spilledProduce}\n` +
      `${skill.name} activations: ${roundDown(skillProcs, 2)}\n` +
      (skillEnergySelfValue > 0 ? `Energy self skill value: ${roundDown(skillEnergySelfValue, 1)} energy\n` : '') +
      (skillEnergyOthersValue > 0 ? `Energy team skill value: ${roundDown(skillEnergyOthersValue, 1)} energy\n` : '') +
      (prettifiedSkillProduce.length > 0 ? `Produce skill value: ${prettifiedSkillProduce.join(' + ')}\n` : '') +
      (skillStrengthValue > 0 ? `Strength skill value: ${roundDown(skillStrengthValue, 1)} strength\n` : '') +
      (skillDreamShardValue > 0 ? `Dream shards skill value: ${roundDown(skillDreamShardValue, 1)} shards\n` : '') +
      (skillPotSizeValue > 0 ? `Pot size skill value: ${roundDown(skillPotSizeValue, 1)} pot size\n` : '') +
      (skillHelpsValue > 0 ? `Helps team skill value: ${roundDown(skillHelpsValue, 1)} helps\n` : '') +
      (skillTastyChanceValue > 0
        ? `Tasty chance skill value: ${roundDown(skillTastyChanceValue, 1)}% crit chance\n`
        : '') +
      `Total helps: ${nrOfHelps}\n` +
      `Helps before sneaky snacking: ${helpsBeforeSS}\n` +
      `Helps spent sneaky snacking: ${helpsAfterSS}\n` +
      `Average time before full inventory: ${
        collectFrequency ? `${prettifyTime(collectFrequency)} (hh:mm:ss)` : 'never'
      }\n` +
      `Average energy: ${roundDown(averageEnergy, 1)}%\n` +
      `Average frequency: ${Math.floor(averageFrequency)}\n` +
      `Total recovery: ${roundDown(totalRecovery, 1)}\n`
    );
  }
}
