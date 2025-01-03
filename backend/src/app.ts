import dotenv from 'dotenv';

import cors from 'cors';

import type { Application, Request, Response } from 'express';
import express from 'express';
import morgan from 'morgan';

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './public/swagger.json' with { type: 'json' };

import { config } from '@src/config/config.js';
import HealthController from '@src/controllers/health/health.controller.js';
import IngredientController from '@src/controllers/ingredient/ingredient.controller.js';
import LoginController from '@src/controllers/login/login.controller.js';
import MainskillController from '@src/controllers/mainskill/mainskill.controller.js';
import MealController from '@src/controllers/meal/meal.controller.js';
import NatureController from '@src/controllers/nature/nature.controller.js';
import PokemonController from '@src/controllers/pokemon/pokemon.controller.js';
import SubskillController from '@src/controllers/subskill/subskill.controller.js';
import TeamController from '@src/controllers/team/team.controller.js';
import TierlistController from '@src/controllers/tierlist/tierlist.controller.js';
import UserController from '@src/controllers/user/user.controller.js';

import DatabaseMigration from '@src/database/migration/database-migration.js';

import { BaseRouter } from '@src/routes/base-router.js';
import { ProductionRouter } from '@src/routes/calculator-router/production-router.js';
import { HealthRouter } from '@src/routes/health-router/health-router.js';
import { IngredientRouter } from '@src/routes/ingredient-router/ingredient-router.js';
import { LoginRouter } from '@src/routes/login-router/login-router.js';
import { MainskillRouter } from '@src/routes/mainskill-router/mainskill-router.js';
import { MealRouter } from '@src/routes/meal-router/meal-router.js';
import { NatureRouter } from '@src/routes/nature-router/nature-router.js';
import { OptimalCombinationRouter } from '@src/routes/optimal-router/optimal-router.js';
import { PokemonRouter } from '@src/routes/pokemon-router/pokemon-router.js';
import { SubskillRouter } from '@src/routes/subskill-router/subskill-router.js';
import { TeamRouter } from '@src/routes/team-router/team-router.js';
import { TierlistRouter } from '@src/routes/tierlist-router/tierlist-router.js';
import { UserRouter } from '@src/routes/user-router/user-router.js';

import { TierlistService } from '@src/services/api-service/tierlist/tierlist-service.js';
import { getDirname, joinPath } from '@src/utils/file-utils/file-utils.js';

async function main() {
  dotenv.config();

  // Database
  const migration = config.DATABASE_MIGRATION;
  if (migration === 'UP') {
    await DatabaseMigration.migrate();
  } else if (migration === 'DOWN') {
    await DatabaseMigration.downgrade();
  } else {
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
      res.status(500).send('Something went wrong');
    }
  });

  // Register routes
  HealthRouter.register(new HealthController());
  MealRouter.register(new MealController());
  PokemonRouter.register(new PokemonController());
  OptimalCombinationRouter.register();
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
    logger.log(`Server is running at ${config.PORT}`);
  });
}

export default main();
