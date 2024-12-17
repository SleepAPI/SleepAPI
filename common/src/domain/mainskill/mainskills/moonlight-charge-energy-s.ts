import { MAINSKILLS, METRONOME_SKILLS } from '../mainskill';
import { Moonlight } from '../modifier';
import { CHARGE_ENERGY_S } from './charge-energy';

const MOONLIGHT_CHARGE_ENERGY_CRIT_CHANCE = 0.5;

export const MOONLIGHT_CHARGE_ENERGY_S = Moonlight(CHARGE_ENERGY_S, MOONLIGHT_CHARGE_ENERGY_CRIT_CHANCE, {
  description: 'Restores ? Energy to the user. Has a chance of restoring ? energy to another Pokémon.',
  RP: [560, 797, 1099, 1516, 2094, 2892],
});

export function moonlightCritAmount(skillLevel: number) {
  const critValues = [6.3, 7.7, 10.1, 13.0, 17.2, 22.8];
  return critValues[skillLevel - 1] ?? 0;
}

MAINSKILLS.push(MOONLIGHT_CHARGE_ENERGY_S);
METRONOME_SKILLS.push(MOONLIGHT_CHARGE_ENERGY_S);
