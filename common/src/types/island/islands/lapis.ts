import { CHERI, DURIN, MAGO } from '../../berry/berries';
import type { Island } from '../island';

export const LAPIS: Island = {
  name: 'Lapis Lakeside',
  shortName: 'lapis',
  rankThresholds: [
    0, 12938, 29756, 48515, 71156, 97031, 130668, 171420, 219936, 272333, 328610, 388122, 452809, 522025, 596086,
    675330, 760123, 850851, 958702, 1075709, 1202596, 1340143, 1489190, 1650645, 1825483, 2014758, 2219603, 2441243,
    2680993, 2925574, 3188730, 3454577, 3739033, 4166848, 5193272
  ],
  berries: [CHERI, DURIN, MAGO],
  expert: false
};
