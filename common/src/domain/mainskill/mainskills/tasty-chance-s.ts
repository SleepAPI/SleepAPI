import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const TASTY_CHANCE_S: Mainskill = createBaseSkill({
  name: 'Tasty Chance S',
  amount: [4, 5, 6, 7, 8, 10],
  unit: 'chance',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description:
    'Raises your Extra Tasty rate by ?%. The effect lasts until you cook an Extra Tasty dish or change sites.',
  RP: [880, 1251, 1726, 2383, 3290, 4546],
});

MAINSKILLS.push(TASTY_CHANCE_S);
