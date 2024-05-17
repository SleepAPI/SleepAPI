import dotenv from 'dotenv';
import { config } from './config/config';

import cors from 'cors';

import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';

import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './public/swagger.json';

import ProductionController from './controllers/calculator/production.controller';
import HealthController from './controllers/health/health.controller';
import IngredientController from './controllers/ingredient/ingredient.controller';
import MainskillController from './controllers/mainskill/mainskill.controller';
import MealController from './controllers/meal/meal.controller';
import NatureController from './controllers/nature/nature.controller';
import OptimalController from './controllers/optimal/optimal.controller';
import PokemonController from './controllers/pokemon/pokemon.controller';
import ShareController from './controllers/share/share.controller';
import SubskillController from './controllers/subskill/subskill.controller';
import TierlistController from './controllers/tierlist/tierlist.controller';
import DatabaseMigration from './database/migration/database-migration';

import LoginController from '@src/controllers/login/login.controller';
import { LoginRouter } from '@src/routes/login-router/login-router';
import { BaseRouter } from './routes/base-router';
import { ProductionRouter } from './routes/calculator-router/production-router';
import { HealthRouter } from './routes/health-router/health-router';
import { IngredientRouter } from './routes/ingredient-router/ingredient-router';
import { MainskillRouter } from './routes/mainskill-router/mainskill-router';
import { MealRouter } from './routes/meal-router/meal-router';
import { NatureRouter } from './routes/nature-router/nature-router';
import { OptimalCombinationRouter } from './routes/optimal-router/optimal-router';
import { PokemonRouter } from './routes/pokemon-router/pokemon-router';
import { ShareRouter } from './routes/share-router/share-router';
import { SubskillRouter } from './routes/subskill-router/subskill-router';
import { TierlistRouter } from './routes/tierlist-router/tierlist-router';
import { TierlistService } from './services/api-service/tierlist/tierlist-service';
import { Logger } from './services/logger/logger';

async function main() {
  dotenv.config();

  // Database
  const migration = config.DATABASE_MIGRATION;
  if (migration === 'UP') {
    await DatabaseMigration.migrate();
  } else if (migration === 'DOWN') {
    await DatabaseMigration.downgrade();
  } else {
    Logger.info('Skipping database migration, set DATABASE_MIGRATION env to UP/DOWN');
  }

  // Tierlist
  if (config.GENERATE_TIERLIST) {
    await TierlistService.seed();
  }

  // Router
  const options: cors.CorsOptions = {
    origin: '*',
  };

  const app: Application = express();

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
  PokemonRouter.register(new PokemonController());
  OptimalCombinationRouter.register(new OptimalController());
  ProductionRouter.register(new ProductionController());
  TierlistRouter.register(new TierlistController());
  IngredientRouter.register(new IngredientController());
  NatureRouter.register(new NatureController());
  MainskillRouter.register(new MainskillController());
  SubskillRouter.register(new SubskillController());
  ShareRouter.register(new ShareController());
  LoginRouter.register(new LoginController());

  app.listen(config.PORT, async () => {
    Logger.log(`Server is running at ${config.PORT}`);
  });
}

export default main();
