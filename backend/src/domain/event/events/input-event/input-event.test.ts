import {
  PlayerInputEvent,
  PokemonInputEvent,
  TeamInputEvent
} from '@src/domain/event/events/input-event/input-event.js';
import { MOCKED_OPTIMAL_PRODUCTION_STATS } from '@src/utils/test-utils/defaults.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { describe, expect, it } from 'bun:test';
import { PINSIR } from 'sleepapi-common';

describe('InputEvent', () => {
  it('pokemon input shall format correctly', () => {
    const event = new PokemonInputEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      pokemon: PINSIR,
      input: MOCKED_OPTIMAL_PRODUCTION_STATS
    });
    expect(event.format()).toMatchInlineSnapshot(
      `"[06:00:00][Input] (PINSIR): Level: 60, Nature: Quiet (+ing -exp), Main skill level: 6, Sub-skills: [Helping Speed M, Ingredient Finder M, Ingredient Finder S]"`
    );
  });

  it('team input shall format correctly', () => {
    const event = new TeamInputEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      input: MOCKED_OPTIMAL_PRODUCTION_STATS
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Input] (Team): E4E: 0, Helping bonus: 0, ERB: 0"`);
  });

  it('player input shall format correctly', () => {
    const event = new PlayerInputEvent({
      time: TimeUtils.parseTime('06:00'),
      description: 'pokemon',
      input: MOCKED_OPTIMAL_PRODUCTION_STATS
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Input] (Player): Camp: no, Recovery incense: no"`);
  });
});
