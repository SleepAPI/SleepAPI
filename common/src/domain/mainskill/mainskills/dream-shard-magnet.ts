import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, METRONOME_SKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const DREAM_SHARD_MAGNET_S: Mainskill = createBaseSkill({
  name: 'Dream Shard Magnet S',
  amount: [240, 340, 480, 670, 920, 1260, 1800],
  unit: 'dream shards',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Obtain ? Dream Shards.',
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
});

export const DREAM_SHARD_MAGNET_S_RANGE: Mainskill = createBaseSkill({
  name: 'Dream Shard Magnet S Range',
  amount: [
    (DREAM_SHARD_MAGNET_S.amounts[0] * 2 + DREAM_SHARD_MAGNET_S.amounts[0] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[1] * 2 + DREAM_SHARD_MAGNET_S.amounts[1] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[2] * 2 + DREAM_SHARD_MAGNET_S.amounts[2] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[3] * 2 + DREAM_SHARD_MAGNET_S.amounts[3] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[4] * 2 + DREAM_SHARD_MAGNET_S.amounts[4] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[5] * 2 + DREAM_SHARD_MAGNET_S.amounts[5] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amounts[6] * 2 + DREAM_SHARD_MAGNET_S.amounts[6] * 0.5) / 2,
  ],
  unit: 'dream shards',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Obtain ? Dream Shards on average.',
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
});

MAINSKILLS.push(DREAM_SHARD_MAGNET_S);
MAINSKILLS.push(DREAM_SHARD_MAGNET_S_RANGE);
METRONOME_SKILLS.push(DREAM_SHARD_MAGNET_S);
METRONOME_SKILLS.push(DREAM_SHARD_MAGNET_S_RANGE);
