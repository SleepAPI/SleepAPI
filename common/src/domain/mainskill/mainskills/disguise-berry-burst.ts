import { MAINSKILLS } from '../mainskill';
import { Disguise } from '../modifier';
import { BERRY_BURST } from './berry-burst';

const BERRY_BURST_CRIT_CHANCE = 0.185;
export const DISGUISE_BERRY_BURST = Disguise(BERRY_BURST, BERRY_BURST_CRIT_CHANCE, {
  amount: [8, 10, 15, 17, 19, 21],
  description:
    'Gets ? Berries plus ? of each of the Berries other Pokémon on your team collect. May activate Greater Success once a day.',
  RP: [1400, 1991, 2747, 3791, 5234, 7232],
});

export const DISGUISE_BERRY_BURST_TEAM_AMOUNT = [1, 2, 2, 3, 4, 5];
export const DISGUISE_CRIT_MULTIPLIER = 3;

MAINSKILLS.push(DISGUISE_BERRY_BURST);
