import { FIGY, LEPPA, SITRUS } from '../../berry/berries';
import type { Island } from '../island';

export const TAUPE: Island = {
  name: 'Taupe Hollow',
  shortName: 'taupe',
  rankThresholds: [
    0, 6885, 15835, 25817, 37865, 51635, 69534, 91221, 117038, 144921, 174869, 206538, 240961, 278826, 320478, 366295,
    416694, 472133, 533116, 600197, 673986, 755154, 844439, 942653, 1050688, 1169527, 1300250, 1444045, 1602220,
    1776213, 1967605, 2333568, 2815203, 3385564, 4219534
  ],
  berries: [FIGY, LEPPA, SITRUS],
  expert: false
};
