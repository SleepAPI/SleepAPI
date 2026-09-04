import { cyanExpertMode } from '../../../events';
import { ORAN, PAMTRE, PECHA } from '../../berry/berries';
import type { ExpertIsland, Island } from '../island';
import { createExpertIsland } from '../island';

export const CYAN: Island = {
  name: 'Cyan Beach',
  shortName: 'cyan',
  rankThresholds: [
    0, 4822, 11090, 18082, 26520, 36164, 48700, 63889, 81971, 101499, 122474, 144654, 168763, 195283, 224455, 256544,
    291842, 330670, 373381, 420363, 472043, 528891, 591424, 660210, 735875, 819107, 910662, 1018462, 1184155, 1379432,
    1709820, 2064310, 2490372, 2994922, 3732664
  ],
  berries: [ORAN, PAMTRE, PECHA],
  expert: false
};

export const CYAN_EXPERT: ExpertIsland = createExpertIsland(
  CYAN,
  'CBEX',
  cyanExpertMode,
  [
    0, 41895, 96358, 157104, 228205, 309675, 418230, 548434, 698799, 860468, 1037612, 1235275, 1444644, 1665846,
    1907355, 2194292, 2495790, 2813784, 3141221, 3489192, 3851643, 4237798, 4654094, 5118523, 5609891, 6124856, 6656321,
    7217801, 7802011, 8552888, 9410567, 10274627, 11147108, 12160074, 14780152
  ]
);
