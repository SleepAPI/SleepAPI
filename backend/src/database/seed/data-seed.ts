import { CookingTierlistService } from '../../services/routing-service/tierlist/cooking-tierlist-service';
import { BuddyCombinationDAO } from '../dao/buddy/buddy-combination-dao';
import { BuddyCombinationForMealDAO } from '../dao/buddy/buddy-combination-for-meal-dao';
import { BuddyCombinationForMeal30DAO } from '../dao/buddy/buddy-combination-for-meal30-dao';
import { BuddyCombination30DAO } from '../dao/buddy/buddy-combination30-dao';
import { PokemonCombinationDAO } from '../dao/pokemon-combination-dao';
import { PokemonCombinationForMealDAO } from '../dao/pokemon-combination-for-meal-dao';
import { PokemonCombinationForMeal30DAO } from '../dao/pokemon-combination-for-meal30-dao';
import { PokemonCombination30DAO } from '../dao/pokemon-combination30-dao';

const DataSeed = new (class {
  public async seed(enableLogging?: boolean, skipLongSeedJobs?: boolean): Promise<void> {
    await PokemonCombinationDAO.seed();
    await PokemonCombination30DAO.seed();
    await PokemonCombinationForMealDAO.seed(enableLogging);
    await PokemonCombinationForMeal30DAO.seed(enableLogging);

    if (!skipLongSeedJobs) {
      await CookingTierlistService.seed();

      await BuddyCombinationDAO.seed();
      await BuddyCombination30DAO.seed();
      await BuddyCombinationForMealDAO.seed(enableLogging);
      await BuddyCombinationForMeal30DAO.seed(enableLogging);
    }
  }
})();

export default DataSeed;
