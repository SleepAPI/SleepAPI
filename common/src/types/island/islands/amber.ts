import { CHESTO, LUM, YACHE } from '../../berry/berries';
import type { Island } from '../island';

export const AMBER: Island = {
  name: 'Amber Canyon',
  shortName: 'amber',
  rankThresholds: [
    0, 26478, 60899, 99293, 145629, 198585, 264456, 344986, 440123, 541880, 654607, 774923, 900988, 1033561, 1176798,
    1325740, 1485571, 1650692, 1828870, 2015408, 2215366, 2427642, 2655957, 2904897, 3179971, 3470704, 3774089, 4097770,
    4430839, 4815792, 5236414, 5715237, 6304719, 7019168, 8528976
  ],
  berries: [CHESTO, LUM, YACHE],
  expert: false
};
