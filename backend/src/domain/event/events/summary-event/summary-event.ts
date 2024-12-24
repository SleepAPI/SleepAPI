import { TimeUtils } from '@src/utils/time-utils/time-utils';
import type { Summary, Time } from 'sleepapi-common';
import { MathUtils, prettifyBerries, prettifyIngredientDrop } from 'sleepapi-common';
import type { EventType } from '../../event';
import { ScheduledEvent } from '../../event';

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
      ingredientPercentage,
      skillPercentage,
      carrySize,
      skill,
      skillProcs,
      skillEnergySelfValue,
      skillEnergyOthersValue,
      skillProduceValue,
      skillBerriesOtherValue,
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
      totalRecovery
    } = this.summary;
    const prettifiedProduce = `${prettifyBerries(totalProduce.berries)} ${
      totalProduce.ingredients.length > 0 ? `+ ${prettifyIngredientDrop(totalProduce.ingredients)}` : ''
    }`;

    const prettifiedSkillProduce: string[] = [];
    if (skillProduceValue.berries) {
      prettifiedSkillProduce.push(prettifyBerries(skillProduceValue.berries));
    }
    if (skillProduceValue.ingredients.length > 0) {
      prettifiedSkillProduce.push(
        `${prettifyIngredientDrop(
          skillProduceValue.ingredients.map(({ amount, ingredient }) => ({
            amount: MathUtils.round(amount, 1),
            ingredient
          }))
        )}`
      );
    }

    const spilledProduce = `${spilledIngredients.length > 0 ? `${prettifyIngredientDrop(spilledIngredients)}` : '-'}`;

    return (
      `-----\n` +
      `[${TimeUtils.prettifyTime(this.time)}][${this.description}]\n` +
      `Total produce: ${prettifiedProduce}\n` +
      `Ingredient percentage: ${MathUtils.round(ingredientPercentage * 100, 1)}%\n` +
      `Skill percentage: ${MathUtils.round(skillPercentage * 100, 1)}%\n` +
      `Carry limit: ${carrySize}\n` +
      `Spilled produce: ${spilledProduce}\n` +
      `${skill.name} activations: ${MathUtils.round(skillProcs, 2)}\n` +
      (skillEnergySelfValue > 0
        ? `Energy self skill value: ${MathUtils.round(skillEnergySelfValue, 1)} energy\n`
        : '') +
      (skillEnergyOthersValue > 0
        ? `Energy team skill value: ${MathUtils.round(skillEnergyOthersValue, 1)} energy\n`
        : '') +
      (prettifiedSkillProduce.length > 0 ? `Produce skill value: ${prettifiedSkillProduce.join(' + ')}\n` : '') +
      (skillBerriesOtherValue > 0 ? `Berries team skill value: ${MathUtils.round(skillBerriesOtherValue, 1)}\n` : '') +
      (skillStrengthValue > 0 ? `Strength skill value: ${MathUtils.round(skillStrengthValue, 1)} strength\n` : '') +
      (skillDreamShardValue > 0
        ? `Dream shards skill value: ${MathUtils.round(skillDreamShardValue, 1)} shards\n`
        : '') +
      (skillPotSizeValue > 0 ? `Pot size skill value: ${MathUtils.round(skillPotSizeValue, 1)} pot size\n` : '') +
      (skillHelpsValue > 0 ? `Helps team skill value: ${MathUtils.round(skillHelpsValue, 1)} helps\n` : '') +
      (skillTastyChanceValue > 0
        ? `Tasty chance skill value: ${MathUtils.round(skillTastyChanceValue, 1)}% crit chance\n`
        : '') +
      `Total helps: ${nrOfHelps}\n` +
      `Helps before sneaky snacking: ${helpsBeforeSS}\n` +
      `Helps spent sneaky snacking: ${helpsAfterSS}\n` +
      `Average time before full inventory: ${
        collectFrequency ? `${TimeUtils.prettifyTime(collectFrequency)} (hh:mm:ss)` : 'never'
      }\n` +
      `Average energy: ${MathUtils.round(averageEnergy, 1)}%\n` +
      `Average frequency: ${Math.floor(averageFrequency)}\n` +
      `Total recovery: ${MathUtils.round(totalRecovery, 1)}\n`
    );
  }
}
