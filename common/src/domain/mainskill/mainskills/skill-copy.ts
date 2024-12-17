import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

// TODO: skill doesn't exist yet, values are guessed
export const SKILL_COPY: Mainskill = createBaseSkill({
  name: 'Skill Copy',
  amount: [1, 2, 3, 4, 5, 6, 7],
  unit: 'copy',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Copies and performs the main skill of one randomly selected Pokémon on the team.',
  RP: [600, 853, 1177, 1625, 2243, 3099, 3984],
});
MAINSKILLS.push(SKILL_COPY);
