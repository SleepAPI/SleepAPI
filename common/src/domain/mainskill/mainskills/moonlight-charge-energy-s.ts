import { MAINSKILLS } from '../mainskill';
import { Moonlight } from '../modifier';
import { CHARGE_ENERGY_S } from './charge-energy';

const MOONLIGHT_CHARGE_ENERGY_CRIT_CHANCE = 0.5;

export const MOONLIGHT_CHARGE_ENERGY_S = Moonlight(CHARGE_ENERGY_S, MOONLIGHT_CHARGE_ENERGY_CRIT_CHANCE, {
  description: 'Restores ? Energy to the user. Has a chance of restoring ? energy to another Pokémon.',
  RP: [560, 797, 1099, 1516, 2094, 2892],
});

// TODO: check if this is flat 50% or an array with unique values
export const MOONLIGHT_CHARGE_ENERGY_CRIT_FACTOR = 0.5;

MAINSKILLS.push(MOONLIGHT_CHARGE_ENERGY_S);
