import { config } from '@src/config/config.js';
import dotenv from 'dotenv';

import cors from 'cors';
import type { Application, Request, Response } from 'express';
import express from 'express';
import morgan from 'morgan';

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './public/swagger.json' with { type: 'json' };

import LoginController from '@src/controllers/login/login.controller.js';
import TeamController from '@src/controllers/team/team.controller.js';
import UserController from '@src/controllers/user/user.controller.js';
import HealthController from './controllers/health/health.controller.js';
import IngredientController from './controllers/ingredient/ingredient.controller.js';
import MainskillController from './controllers/mainskill/mainskill.controller.js';
import MealController from './controllers/meal/meal.controller.js';
import NatureController from './controllers/nature/nature.controller.js';
import PokemonController from './controllers/pokemon/pokemon.controller.js';
import SubskillController from './controllers/subskill/subskill.controller.js';
import TierlistController from './controllers/tierlist/tierlist.controller.js';
import DatabaseMigration from './database/migration/database-migration.js';

import { LoginRouter } from '@src/routes/login-router/login-router.js';
import { TeamRouter } from '@src/routes/team-router/team-router.js';
import { UserRouter } from '@src/routes/user-router/user-router.js';
import { TierlistService } from '@src/services/tier-list/tierlist-service.js';
import { getDirname, joinPath } from '@src/utils/file-utils/file-utils.js';
import { BaseRouter } from './routes/base-router.js';
import { ProductionRouter } from './routes/calculator-router/production-router.js';
import { HealthRouter } from './routes/health-router/health-router.js';
import { IngredientRouter } from './routes/ingredient-router/ingredient-router.js';
import { MainskillRouter } from './routes/mainskill-router/mainskill-router.js';
import { MealRouter } from './routes/meal-router/meal-router.js';
import { NatureRouter } from './routes/nature-router/nature-router.js';
import { PokemonRouter } from './routes/pokemon-router/pokemon-router.js';
import { SolveRouter } from './routes/solve-router/solve-router.js';
import { SubskillRouter } from './routes/subskill-router/subskill-router.js';
import { TierlistRouter } from './routes/tierlist-router/tierlist-router.js';

async function main() {
  dotenv.config(); // TODO: is this not done double? It's done in config.ts too

  // Database
  const migration = config.DATABASE_MIGRATION;
  if (migration === 'UP') {
    await DatabaseMigration.migrate();
  } else if (migration === 'DOWN') {
    await DatabaseMigration.downgrade();
  } else {
    logger.info('Skipping database migration, set DATABASE_MIGRATION env to UP/DOWN');
    logger.info('Skipping database migration, set DATABASE_MIGRATION env to UP/DOWN');
  }

  // Tierlist
  if (config.GENERATE_TIERLIST) {
    await TierlistService.seed();
  }

  // Router
  const options: cors.CorsOptions = {
    origin: '*'
  };

  const app: Application = express();
  // Middleware
  app.use(express.json());
  app.use(morgan('tiny')); // TODO: replace morgan with custom HTTP log
  app.use(cors(options));
  app.use('/api', BaseRouter.router);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customSiteTitle: 'Sleep API' }));
  app.use(express.static(joinPath('assets', import.meta.url)));
  app.get('/', (req: Request, res: Response) => {
    try {
      const { __dirname } = getDirname(import.meta.url);
      res.sendFile('./assets/index.html', { root: __dirname });
    } catch (err) {
      logger.error(err as Error);
      logger.error(err as Error);
      res.status(500).send('Something went wrong');
    }
  });

  // Register routes
  HealthRouter.register(new HealthController());
  MealRouter.register(new MealController());
  PokemonRouter.register(new PokemonController());
  SolveRouter.register();
  ProductionRouter.register();
  TierlistRouter.register(new TierlistController());
  IngredientRouter.register(new IngredientController());
  NatureRouter.register(new NatureController());
  MainskillRouter.register(new MainskillController());
  SubskillRouter.register(new SubskillController());
  LoginRouter.register(new LoginController());
  TeamRouter.register(new TeamController());
  UserRouter.register(new UserController());

  app.listen(config.PORT, async () => {
    logger.info(`Server is running at ${config.PORT}`);
  });
}

export default main();
