import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const CHARGE_STRENGTH_S: Mainskill = createBaseSkill({
  name: 'Charge Strength S',
  amount: [400, 569, 785, 1083, 1496, 2066, 3002],
  unit: 'strength',
  maxLevel: MAX_SKILL_LEVEL,
  description: "Increases Snorlax's Strength by ?.",
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
});

export const CHARGE_STRENGTH_S_RANGE: Mainskill = createBaseSkill({
  name: 'Charge Strength S Range',
  amount: [
    (CHARGE_STRENGTH_S.amounts[0] * 2 + CHARGE_STRENGTH_S.amounts[0] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amounts[1] * 2 + CHARGE_STRENGTH_S.amounts[1] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amounts[2] * 2 + CHARGE_STRENGTH_S.amounts[2] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amounts[3] * 2 + CHARGE_STRENGTH_S.amounts[3] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amounts[4] * 2 + CHARGE_STRENGTH_S.amounts[4] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amounts[5] * 2 + CHARGE_STRENGTH_S.amounts[5] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amounts[6] * 2 + CHARGE_STRENGTH_S.amounts[6] * 0.5) / 2,
  ],
  unit: 'strength',
  maxLevel: MAX_SKILL_LEVEL,
  description: "Increases Snorlax's Strength on average by ?.",
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
});

MAINSKILLS.push(CHARGE_STRENGTH_S);
MAINSKILLS.push(CHARGE_STRENGTH_S_RANGE);
