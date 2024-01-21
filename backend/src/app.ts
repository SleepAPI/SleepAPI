import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/config';
import ProductionController from './controllers/calculator/production.controller';
import HealthController from './controllers/health/health.controller';
import IngredientController from './controllers/ingredient/ingredient.controller';
import MealController from './controllers/meal/meal.controller';
import NatureController from './controllers/nature/nature.controller';
import OptimalController from './controllers/optimal/optimal.controller';
import PokemonController from './controllers/pokemon/pokemon.controller';
import RankingController from './controllers/ranking/ranking.controller';
import TierlistController from './controllers/tierlist/tierlist.controller';
import DatabaseMigration from './database/migration/database-migration';
import DataSeed from './database/seed/data-seed';
import swaggerDocument from './public/swagger.json';
import { BaseRouter } from './routes/base-router';
import { ProductionRouter } from './routes/calculator-router/production-router';
import { HealthRouter } from './routes/health-router/health-router';
import { IngredientRouter } from './routes/ingredient-router/ingredient-router';
import { MealRouter } from './routes/meal-router/meal-router';
import { NatureRouter } from './routes/nature-router/nature-router';
import { OptimalCombinationRouter } from './routes/optimal-router/optimal-router';
import { PokemonRouter } from './routes/pokemon-router/pokemon-router';
import { RankingRouter } from './routes/ranking-router/ranking-router';
import { TierlistRouter } from './routes/tierlist-router/tierlist-router';
import { Logger } from './services/logger/logger';

async function main() {
  dotenv.config();

  // Database
  const migration = config.DATABASE_MIGRATION;
  if (migration === 'UP') {
    await DatabaseMigration.migrate();
    await DataSeed.seed(true);
  } else if (migration === 'DOWN') {
    await DatabaseMigration.downgrade();
  } else {
    Logger.info('Skipping database migration, set DATABASE_MIGRATION env to UP/DOWN');
  }

  // Router
  const allowedOrigins = ['http://localhost:3000'];
  const options: cors.CorsOptions = {
    origin: allowedOrigins,
  };

  const app: Application = express();
  const port = config.PORT ?? 3000;

  // Middleware
  app.use(express.json());
  app.use(morgan('tiny'));
  app.use(cors(options));
  app.use('/api', BaseRouter.router);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customSiteTitle: 'Sleep API' }));
  app.use(express.static(path.join(__dirname, 'assets')));
  app.get('/', (req: Request, res: Response) => {
    try {
      res.sendFile('./assets/index.html', { root: __dirname });
    } catch (err) {
      Logger.error(err as Error);
      res.status(500).send('Something went wrong');
    }
  });

  // Register routes
  HealthRouter.register(new HealthController());
  MealRouter.register(new MealController());
  RankingRouter.register(new RankingController());
  PokemonRouter.register(new PokemonController());
  OptimalCombinationRouter.register(new OptimalController());
  ProductionRouter.register(new ProductionController());
  TierlistRouter.register(new TierlistController());
  IngredientRouter.register(new IngredientController());
  NatureRouter.register(new NatureController());

  app.listen(port, async () => {
    Logger.log(`Server is running at ${port}`);
  });
}

export default main();
