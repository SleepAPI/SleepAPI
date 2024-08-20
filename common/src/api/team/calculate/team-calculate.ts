import { PokemonInstance } from '../../../api/pokemon/pokemon-instance';
import { BerrySet } from '../../../domain/types/berry-drop';
import { IngredientSet } from '../../../domain/types/ingredient-set';

export interface TeamSettingsRequest {
  camp: boolean;
  bedtime: string;
  wakeup: string;
}

export interface PokemonInstanceIdentity extends PokemonInstance {
  externalId?: string;
}

export interface CalculateTeamRequest {
  settings: TeamSettingsRequest;
  members: PokemonInstanceIdentity[];
}

export interface MemberProductionAdvanced {
  spilledIngredients: IngredientSet[];
  totalHelps: number;
  dayHelps: number;
  nightHelps: number;
  nightHelpsBeforeSS: number;
  nightHelpsAfterSS: number;
}

export interface MemberProduction {
  berries?: BerrySet;
  ingredients: IngredientSet[];
  skillProcs: number;
  externalId?: string;
  advanced: MemberProductionAdvanced;
}

export interface CalculateTeamResponse {
  members: MemberProduction[];
}
