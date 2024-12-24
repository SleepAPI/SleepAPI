import { MOCKED_MAIN_SLEEP } from '@src/utils/test-utils/defaults';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { SleepEvent } from './sleep-event';

describe('SleepEvent', () => {
  it('sleep event end type shall format correctly', () => {
    const event = new SleepEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'test',
      period: MOCKED_MAIN_SLEEP,
      sleepState: 'end'
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Sleep] (test): Duration 15:30:00, Score (100)"`);
  });

  it('sleep event start type shall format correctly', () => {
    const event = new SleepEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'test',
      period: MOCKED_MAIN_SLEEP,
      sleepState: 'start'
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Sleep] (test): Duration 15:30:00"`);
  });
});
