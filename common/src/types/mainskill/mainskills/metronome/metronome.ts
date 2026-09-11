import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill, MAINSKILLS } from '../../mainskill';
import { Psystrike } from '../berry-zone/psystrike';
import { BerryBurstDisguise } from '../berry-burst/berry-burst-disguise';
import { ChargeStrengthMBadDreams } from '../charge-strength-m/charge-strength-m-bad-dreams';
import { IngredientDrawSCutiefly, IngredientDrawSDwebble, IngredientDrawSSandshrew } from '../ingredient-draw-s';
import { IngredientMagnetSPlusToxtricity } from '../ingredient-magnet-s';
import { SkillCopyMimic } from '../skill-copy/skill-copy_mimic';
import { SkillCopyTransform } from '../skill-copy/skill-copy_transform';

export const Metronome = new (class extends Mainskill {
  name = 'Metronome';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  description = (_params: AmountParams) => `Uses one randomly chosen main skill.`;
  activations: ActivationsType = {};
  image = 'metronome';

  readonly blockedSkills: Mainskill[] = [
    this,
    BerryBurstDisguise,
    ChargeStrengthMBadDreams,
    Psystrike, // Keep the prototype out of random skill rolls until availability is confirmed.
    IngredientDrawSSandshrew,
    IngredientDrawSDwebble,
    IngredientDrawSCutiefly,
    IngredientMagnetSPlusToxtricity,
    SkillCopyMimic,
    SkillCopyTransform
  ];

  get metronomeSkills(): Mainskill[] {
    return MAINSKILLS.filter((skill) => {
      return !this.blockedSkills.some((blockedSkill) => skill.is(blockedSkill));
    });
  }
})(true);
