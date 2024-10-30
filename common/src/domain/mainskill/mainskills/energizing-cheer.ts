import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const ENERGIZING_CHEER_S: Mainskill = createBaseSkill({
  name: 'Energizing Cheer S',
  amount: [14, 17, 22, 28, 38, 50],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to one random Pokémon on your team.',
  RP: [880, 1251, 1726, 2383, 3290, 4546],
});

MAINSKILLS.push(ENERGIZING_CHEER_S);
