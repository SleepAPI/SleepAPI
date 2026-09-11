import { greengrassExpertMode } from '../../../events';
import type { ExpertIsland, Island } from '../island';
import { createExpertIsland } from '../island';

export const GREENGRASS: Island = {
  name: 'Greengrass Isle',
  shortName: 'greengrass',
  rankThresholds: [
    0, 3118, 7171, 11693, 17149, 23385, 31492, 41314, 53006, 65634, 79197, 93540, 109130, 125032, 156121, 187832,
    220177, 253169, 286821, 321146, 356158, 391870, 428296, 465451, 532707, 601308, 742056, 885619, 1029700, 1199506,
    1486800, 1795052, 2165541, 2604280, 3245795
  ],
  berries: [],
  expert: false
};

export const GREENGRASS_EXPERT: ExpertIsland = createExpertIsland(
  GREENGRASS,
  'GGEX',
  greengrassExpertMode,
  [
    0, 41895, 96358, 157104, 228205, 309675, 414995, 539088, 684812, 839478, 997610, 1178280, 1374658, 1580857, 1797364,
    2014314, 2251791, 2501141, 2760321, 3057187, 3361630, 3667816, 4014149, 4378519, 4778794, 5184989, 5614239, 6067795,
    6541407, 7152862, 7780648, 8414117, 9067058, 9752517, 10981171
  ]
);
