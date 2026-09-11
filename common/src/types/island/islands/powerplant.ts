import { BELUE, BLUK, GREPA } from '../../berry/berries';
import type { Island } from '../island';

export const POWER_PLANT: Island = {
  name: 'Old Gold Power Plant',
  shortName: 'powerplant',
  rankThresholds: [
    0, 20142, 46326, 75531, 110779, 151061, 203429, 266875, 342406, 423979, 511595, 604246, 704953, 810696, 921725,
    1038306, 1160717, 1289248, 1431702, 1582395, 1741777, 1910321, 2088527, 2276921, 2476059, 2686523, 2908932, 3143935,
    3442846, 3744954, 4086475, 4451914, 4909073, 5472793, 6674166
  ],
  berries: [BELUE, BLUK, GREPA],
  expert: false
};
