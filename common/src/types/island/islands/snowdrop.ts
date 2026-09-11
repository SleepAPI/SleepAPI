import { PERSIM, RAWST, WIKI } from '../../berry/berries';
import type { Island } from '../island';

export const SNOWDROP: Island = {
  name: 'Snowdrop Tundra',
  shortName: 'snowdrop',
  rankThresholds: [
    0, 10486, 24118, 39323, 57673, 78645, 105909, 138940, 178262, 220730, 266344, 314580, 367010, 424683, 488123,
    557907, 634669, 719107, 811989, 914159, 1026546, 1150172, 1286161, 1435749, 1600296, 1781298, 1980400, 2199412,
    2440325, 2705329, 2996833, 3317487, 3670206, 4058197, 4706403
  ],
  berries: [PERSIM, RAWST, WIKI],
  expert: false
};
