import { MAX_SKILL_LEVEL } from '../../constants';
import type { Mainskill } from '../mainskill';
import { INGREDIENT_SUPPORT_MAINSKILLS, MAINSKILLS, METRONOME_SKILLS, createBaseSkill } from '../mainskill';

export const ENERGY_FOR_EVERYONE: Mainskill = createBaseSkill({
  name: 'Energy For Everyone',
  amount: [5, 7, 9, 11.4, 15, 18.1],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to each helper Pokémon on your team.',
  RP: [1120, 1593, 2197, 3033, 4187, 5785]
});

MAINSKILLS.push(ENERGY_FOR_EVERYONE);
METRONOME_SKILLS.push(ENERGY_FOR_EVERYONE);
INGREDIENT_SUPPORT_MAINSKILLS.push(ENERGY_FOR_EVERYONE);
