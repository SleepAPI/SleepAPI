import { Request, Response } from 'express';
import PokemonController from '../../controllers/pokemon/pokemon.controller';
import { IngredientDrop } from '../../domain/produce/ingredient';
import { Logger } from '../../services/logger/logger';
import { queryAsBoolean, respondWithCSV } from '../../utils/routing/routing-utils';
import { BaseRouter } from '../base-router';

export interface GetPokemonQueryParams {
  cyan?: boolean;
  taupe?: boolean;
  snowdrop?: boolean;
  lapis?: boolean;
  csv?: boolean;
}

export interface MealsForPokemonRequestQueryParams {
  limit30?: boolean;
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  pretty?: boolean;
  csv?: boolean;
}

export interface PokemonResult {
  pokemon: string;
  ingredientList: IngredientDrop[];
  ingredientsProduced: IngredientDrop[];
  averagePercentage: number;
  generalistRanking: number;
  meals: {
    meal: string;
    percentage: number;
  }[];
}

class PokemonRouterImpl {
  public async register(controller: PokemonController) {
    BaseRouter.router.get(
      '/pokemon',
      async (req: Request<unknown, unknown, unknown, GetPokemonQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /pokemon');
          const pokemonData = await controller.getPokemon(req.query);

          if (queryAsBoolean(req.query.csv)) {
            const data = 'Name\n' + `${pokemonData.join('\n')}`;
            respondWithCSV(res, data, 'pokemon');
          } else {
            res.header('Content-Type', 'application/json').send(JSON.stringify(pokemonData, null, 4));
          }
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const PokemonRouter = new PokemonRouterImpl();
