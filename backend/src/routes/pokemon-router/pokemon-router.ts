import express, { Request, Response } from 'express';
import PokemonController from '../../controllers/pokemon/pokemon.controller';
import { IngredientDrop } from '../../domain/produce/ingredient';
import { CSVConverterService } from '../../services/csv-converter/csv-converter-service';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import { queryAsBoolean, respondWithCSV } from '../../utils/routing/routing-utils';

export interface GetPokemonQueryParams {
  cyan?: boolean;
  taupe?: boolean;
  snowdrop?: boolean;
  lapis?: boolean;
  csv?: boolean;
}

export interface MealsForPokemonRequestQueryParams {
  limit30?: boolean;
  advanced?: boolean;
  unlocked?: boolean;
  lategame?: boolean;
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
  public router = express.Router();

  public async register(controller: PokemonController) {
    this.router.get(
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

    this.router.get(
      '/pokemon/:name',
      async (req: Request<{ name: string }, unknown, unknown, MealsForPokemonRequestQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /pokemon/:name');
          const { pretty, csv } = req.query;
          const { name } = req.params;

          const data: PokemonResult[] = await controller.getPokemonRankingRaw(name, req.query);

          if (queryAsBoolean(csv)) {
            const pokemonData = CSVConverterService.toPokemonRanking(data);
            respondWithCSV(res, pokemonData, name);
          } else if (queryAsBoolean(pretty)) {
            const pokemonData = WebsiteConverterService.toPokemonRanking(data);
            res.header('Content-Type', 'application/json').send(JSON.stringify(pokemonData, null, 4));
          } else {
            res.header('Content-Type', 'application/json').send(JSON.stringify(data, null, 4));
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
