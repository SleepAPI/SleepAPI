import { MOCKED_OPTIMAL_PRODUCTION_STATS } from '@src/utils/test-utils/defaults';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { pokemon } from 'sleepapi-common';
import { PlayerInputEvent, PokemonInputEvent, TeamInputEvent } from './input-event';

describe('InputEvent', () => {
  it('pokemon input shall format correctly', () => {
    const event = new PokemonInputEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      pokemon: pokemon.PINSIR,
      input: MOCKED_OPTIMAL_PRODUCTION_STATS,
    });
    expect(event.format()).toMatchInlineSnapshot(
      `"[06:00:00][Input] (PINSIR): Level: 60, Nature: Quiet (+ing -exp), Main skill level: 6, Sub-skills: [Helping Speed M, Ingredient Finder M, Ingredient Finder S]"`
    );
  });

  it('team input shall format correctly', () => {
    const event = new TeamInputEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      input: MOCKED_OPTIMAL_PRODUCTION_STATS,
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Input] (Team): E4E: 0, Helping bonus: 0, ERB: 0"`);
  });

  it('player input shall format correctly', () => {
    const event = new PlayerInputEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      input: MOCKED_OPTIMAL_PRODUCTION_STATS,
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Input] (Player): Camp: no, Recovery incense: no"`);
  });
});
