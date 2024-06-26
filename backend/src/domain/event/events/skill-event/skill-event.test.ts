import { MOCKED_PRODUCE } from '@src/utils/test-utils/defaults';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { mainskill } from 'sleepapi-common';
import { SkillEvent } from './skill-event';

describe('SkillEvent', () => {
  it('skill event shall format correctly', () => {
    const event = new SkillEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'test',
      skillActivation: {
        skill: mainskill.INGREDIENT_MAGNET_S,
        adjustedAmount: 0.5,
        fractionOfProc: 0.5,
        nrOfHelpsToActivate: 10,
        adjustedProduce: MOCKED_PRODUCE,
      },
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Skill] (test): 0.5 ingredients (50% strength)"`);
  });
});
