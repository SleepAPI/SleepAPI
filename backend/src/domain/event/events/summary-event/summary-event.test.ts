import { MOCKED_PRODUCE } from '@src/utils/test-utils/defaults';
import { parseTime } from '@src/utils/time-utils/time-utils';
import { Summary, SummaryEvent } from './summary-event';

describe('SummaryEvent', () => {
  it('summary event shall format correctly', () => {
    const summary: Summary = {
      averageEnergy: 0,
      averageFrequency: 1,
      helpsAfterSS: 2,
      helpsBeforeSS: 3,
      nrOfHelps: 5,
      spilledIngredients: MOCKED_PRODUCE.ingredients,
      totalProduce: MOCKED_PRODUCE,
      totalRecovery: 6,
      collectFrequency: parseTime('00:10'),
    };
    const event = new SummaryEvent({
      time: parseTime('06:00'),
      description: 'pokemon',
      summary,
    });
    expect(event.format()).toMatchInlineSnapshot(`
      "-----
      [06:00:00][pokemon]
      Total produce: 2 GREPA + 1 Apple
      Spilled produce: 1 Apple
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
