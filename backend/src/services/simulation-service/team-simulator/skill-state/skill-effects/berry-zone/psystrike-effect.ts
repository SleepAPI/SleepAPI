import type { SkillEffect } from '../../skill-effect.js';
import type { SkillActivation } from '../../skill-state-types.js';
import type { SkillState } from '../../skill-state.js';
import { berry, Psystrike } from 'sleepapi-common';

export class PsystrikeEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    skillState.memberState.berryZoneState.addBonus(
      berry.MAGO,
      Psystrike.berryZoneAmount({ skillLevel: skillState.skillLevel }),
      Psystrike.maximumBonus
    );
    return {
      skill: Psystrike,
      activations: [
        {
          unit: 'strength',
          self: { regular: skillState.skillAmount(Psystrike.activations.strength), crit: 0 }
        }
      ]
    };
  }
}
