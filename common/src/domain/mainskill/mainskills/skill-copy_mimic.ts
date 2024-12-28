import { MAINSKILLS } from '../mainskill';
import { Mimic } from '../modifier';
import { SKILL_COPY } from './skill-copy';

export const SKILL_COPY_MIMIC = Mimic(SKILL_COPY, 0, {
  amount: [1, 2, 3, 4, 5, 6, 7],
  description: 'Copies and performs the main skill of one randomly selected Pokémon on the team.',
  RP: [600, 853, 1177, 1625, 2243, 3099, 3984]
});

MAINSKILLS.push(SKILL_COPY_MIMIC);
