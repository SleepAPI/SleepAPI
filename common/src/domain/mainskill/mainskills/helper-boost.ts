import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, METRONOME_SKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const HELPER_BOOST: Mainskill = createBaseSkill({
  name: 'Helper Boost',
  amount: [2, 3, 3, 4, 4, 5],
  unit: 'helps',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description:
    'Instantly gets your x? the usual help from all Pokémon on your team. Meet certain conditions to boost effect.',
  RP: [2800, 3902, 5273, 6975, 9317, 12438],
});

export const HELPER_BOOST_UNIQUE_BOOST_TABLE: number[][] = [
  // Skill level 1 to 6
  [0, 0, 0, 0, 0, 0], // unique: 1
  [0, 0, 0, 0, 1, 1], // unique: 2
  [1, 1, 2, 2, 3, 3], // unique: 3
  [2, 2, 3, 3, 4, 4], // unique: 4
  [4, 4, 5, 5, 6, 6], // unique: 5
];

MAINSKILLS.push(HELPER_BOOST);
METRONOME_SKILLS.push(HELPER_BOOST);
