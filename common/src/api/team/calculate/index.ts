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

export interface MemberProduction {
  berries?: BerrySet;
  ingredients: IngredientSet[];
  skillProcs: number;
  externalId?: string;
}
export interface CalculateTeamResponse {
  members: MemberProduction[];
}
