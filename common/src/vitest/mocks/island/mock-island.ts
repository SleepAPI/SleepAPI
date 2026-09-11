import { greengrassExpertMode } from '../../../events';
import type {
  Berry,
  ExpertIsland,
  ExpertIslandInstance,
  ExpertModeSettings,
  Island,
  IslandInstance,
  TeamAreaDTO
} from '../../../types';
import { GREENGRASS, GREENGRASS_EXPERT } from '../../../types';
import { BELUE, BLUK, GREPA } from '../../../types/berry/berries';

export function island(attrs?: Partial<Island>): Island {
  return {
    name: 'Mock Island',
    berries: [],
    shortName: 'greengrass',
    rankThresholds: GREENGRASS.rankThresholds,
    ...attrs,
    expert: false
  };
}

export function expertIsland(attrs?: Partial<ExpertIsland>): ExpertIsland {
  return {
    name: 'Mock Island (Expert Mode)',
    shortName: 'GGEX',
    base: GREENGRASS,
    bonuses: greengrassExpertMode,
    rankThresholds: GREENGRASS_EXPERT.rankThresholds,
    ...attrs,
    expert: true
  };
}

type BaseIslandInstanceInput = Partial<Omit<Island, 'expert'>> & {
  expert?: false;
  areaBonus?: number;
};

type ExpertIslandInstanceInput = Partial<Omit<ExpertIsland, 'expert' | 'base'>> & {
  expert: true;
  base?: Island;
  berries?: Berry[];
  areaBonus?: number;
  expertMode?: ExpertModeSettings;
};

type IslandInstanceInput = BaseIslandInstanceInput | ExpertIslandInstanceInput;

export function islandInstance(attrs?: IslandInstanceInput): IslandInstance {
  if (attrs?.expert === true) {
    return {
      ...expertIsland({ base: attrs.base ?? GREENGRASS }),
      areaBonus: 0,
      berries: [],
      ...attrs,
      base: attrs.base ?? GREENGRASS
    };
  }
  return {
    ...island(),
    areaBonus: 0,
    ...attrs
  };
}

export function expertIslandInstance(attrs?: Partial<ExpertIslandInstance>): ExpertIslandInstance {
  return {
    ...expertIsland(),
    areaBonus: 0,
    berries: [],
    ...attrs,
    expert: true,
    base: attrs?.base ?? GREENGRASS
  };
}

export function islandDTO(attrs?: Partial<TeamAreaDTO>): TeamAreaDTO {
  return {
    islandName: 'greengrass',
    favoredBerries: '',
    ...attrs
  };
}

export function expertModeSettings(attrs?: Partial<ExpertModeSettings>): ExpertModeSettings {
  return {
    mainFavoriteBerry: BELUE,
    subFavoriteBerries: [GREPA, BLUK],
    randomBonus: 'ingredient',
    ...attrs
  };
}

export function expertIslandDTO(attrs?: Partial<TeamAreaDTO>): TeamAreaDTO {
  return {
    islandName: 'GGEX',
    favoredBerries: 'BELUE',
    expertModifier: 'ingredient',
    mainFavoriteBerry: 'BELUE',
    subFavoriteBerries: 'GREPA,BLUK',
    ...attrs
  };
}
