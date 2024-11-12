import { SummaryEvent } from '@src/domain/event/events/summary-event/summary-event';
import { MOCKED_PRODUCE } from '@src/utils/test-utils/defaults';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { Summary, mainskill } from 'sleepapi-common';

describe('SummaryEvent', () => {
  it('summary event shall format correctly', () => {
    const summary: Summary = {
      ingredientPercentage: 0.2,
      carrySize: 23,
      skillPercentage: 0.02,
      skill: mainskill.CHARGE_STRENGTH_S,
      skillProcs: 11,
      skillEnergySelfValue: 11,
      skillEnergyOthersValue: 11,
      skillProduceValue: MOCKED_PRODUCE,
      skillStrengthValue: 11,
      skillDreamShardValue: 11,
      skillPotSizeValue: 11,
      skillHelpsValue: 11,
      skillTastyChanceValue: 11,
      averageEnergy: 0,
      averageFrequency: 1,
      helpsAfterSS: 2,
      helpsBeforeSS: 3,
      nrOfHelps: 5,
      spilledIngredients: MOCKED_PRODUCE.ingredients,
      totalProduce: MOCKED_PRODUCE,
      totalRecovery: 6,
      collectFrequency: TimeUtils.parseTime('00:10'),
      skillBerriesOtherValue: 10,
    };
    const event = new SummaryEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      summary,
    });
    expect(event.format()).toMatchInlineSnapshot(`
      "-----
      [06:00:00][pokemon]
      Total produce: 2 GREPA + 1 Apple
      Ingredient percentage: 20%
      Skill percentage: 2%
      Carry limit: 23
      Spilled produce: 1 Apple
      Charge Strength S activations: 11
      Energy self skill value: 11 energy
      Energy team skill value: 11 energy
      Produce skill value: 2 GREPA + 1 Apple
      Berries team skill value: 10
      Strength skill value: 11 strength
      Dream shards skill value: 11 shards
      Pot size skill value: 11 pot size
      Helps team skill value: 11 helps
      Tasty chance skill value: 11% crit chance
      Total helps: 5
      Helps before sneaky snacking: 3
      Helps spent sneaky snacking: 2
      Average time before full inventory: 00:10:00 (hh:mm:ss)
      Average energy: 0%
      Average frequency: 1
      Total recovery: 6
      "
    `);
  });
});
