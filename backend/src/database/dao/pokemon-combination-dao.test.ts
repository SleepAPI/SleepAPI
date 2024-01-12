import { DaoFixture } from '../../utils/test-utils/dao-fixture';
import { PokemonCombinationDAO } from './pokemon-combination-dao';

DaoFixture.init();

describe('pokemon-combination-dao', () => {
  it('insert', async () => {
    const pokemonCombination = {
      pokemon: 'some-pokemon',
      berry: 'some-berry',
      ingredient0: 'first-ingredient',
      ingredient30: 'second-ingredient',
      ingredient60: 'third-ingredient',
      amount0: 1,
      amount30: 1,
      amount60: 1,
      produced_amount0: 3,
      produced_amount30: 3,
      produced_amount60: 3,
    };
    const result = await PokemonCombinationDAO.insert(pokemonCombination);
    expect(result).toMatchInlineSnapshot(`
      {
        "amount0": 1,
        "amount30": 1,
        "amount60": 1,
        "berry": "some-berry",
        "id": 1,
        "ingredient0": "first-ingredient",
        "ingredient30": "second-ingredient",
        "ingredient60": "third-ingredient",
        "pokemon": "some-pokemon",
        "produced_amount0": 3,
        "produced_amount30": 3,
        "produced_amount60": 3,
      }
    `);
  });
});
