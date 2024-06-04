import { PokemonTemplate } from '../pokemon/pokemon-template';

export interface PokemonInstance extends PokemonTemplate {
  externalId: string;
}
