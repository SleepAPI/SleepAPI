import type { Berry } from '../berry/berry';
import type { ExpertModeBonuses, ExpertModeSettings, ExpertRandomBonusType } from '../expert-mode';

export type IslandShortName =
  'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant' | 'amber' | 'GGEX' | 'CBEX';

interface IslandBase {
  name: string;
  shortName: IslandShortName;
}

export interface Island extends IslandBase {
  berries: Berry[];
  expert: false;
}

// An expert island definition has no fixed favorite berries
export interface ExpertIsland extends IslandBase {
  expert: true;
  base: Island;
  bonuses: ExpertModeBonuses;
}

/**
 * Discriminated union of base and expert islands. Narrow via the `expert` property.
 */
export type Area = Island | ExpertIsland;

export type BaseIslandInstance = Island & {
  areaBonus: number;
  expertMode?: undefined;
  base?: undefined;
};
export type ExpertIslandInstance = ExpertIsland & {
  areaBonus: number;
  berries: Berry[];
  expertMode?: ExpertModeSettings;
};

/**
 * Runtime island instance, either base or expert. Narrow via the `expert` property.
 */
export type IslandInstance = BaseIslandInstance | ExpertIslandInstance;

export type IslandInstanceDto = IslandBase & {
  areaBonus: number;
  berries: Berry[];
  expertMode?: ExpertModeSettings;
};

/**
 * Factory for expert island definitions. Derives `name` from the base island as
 * `${base.name} (Expert Mode)`.
 */
export function createExpertIsland(base: Island, shortName: IslandShortName, bonuses: ExpertModeBonuses): ExpertIsland {
  return {
    name: `${base.name} (Expert Mode)`,
    shortName,
    bonuses,
    expert: true,
    base
  };
}

export interface TeamAreaDTO {
  islandName: IslandShortName;
  favoredBerries: string;
  expertModifier?: ExpertRandomBonusType;
  mainFavoriteBerry?: string;
  subFavoriteBerries?: string;
}
