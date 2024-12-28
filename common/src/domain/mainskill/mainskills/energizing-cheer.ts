import { MAX_SKILL_LEVEL } from '../../constants';
import type { Mainskill } from '../mainskill';
import { MAINSKILLS, METRONOME_SKILLS, createBaseSkill } from '../mainskill';

export const ENERGIZING_CHEER_S: Mainskill = createBaseSkill({
  name: 'Energizing Cheer S',
  amount: [14, 17.1, 22.5, 28.8, 38.2, 50.6],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to one random Pokémon on your team.',
  RP: [880, 1251, 1726, 2383, 3290, 4546]
});

export const ENERGIZING_CHEER_TARGET_LOWEST_CHANCE = 0.5;

MAINSKILLS.push(ENERGIZING_CHEER_S);
METRONOME_SKILLS.push(ENERGIZING_CHEER_S);
