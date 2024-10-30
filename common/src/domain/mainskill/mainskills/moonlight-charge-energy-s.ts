import { MAINSKILLS } from '../mainskill';
import { Moonlight } from '../modifier';
import { CHARGE_ENERGY_S } from './charge-energy';

export const MOONLIGHT_CHARGE_ENERGY_S = Moonlight(CHARGE_ENERGY_S.attributes, {
  description: 'Restores ? Energy to the user. Has a chance of restoring ? energy to another Pokémon.',
  RP: [560, 797, 1099, 1516, 2094, 2892],
});

MAINSKILLS.push(MOONLIGHT_CHARGE_ENERGY_S);
