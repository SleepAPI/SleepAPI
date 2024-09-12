import { RecipeType } from '../../../domain/recipe/recipe';
import { PokemonInstanceWithMeta } from '../../pokemon/pokemon-instance';

export interface MemberInstance extends PokemonInstanceWithMeta {
  memberIndex: number;
}

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  favoredBerries?: string[];
  version: number;

  members: MemberInstance[];
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
