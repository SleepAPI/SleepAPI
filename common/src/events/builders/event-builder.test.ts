import { describe, expect, it } from 'vitest';
import type { AmountParams, ExpertModeSettings } from '../../types';
import { MAGO, ORAN, SITRUS } from '../../types/berry/berries';
import { Mainskill } from '../../types/mainskill/mainskill';
import { commonMocks } from '../../vitest';
import { EventBuilder, type FunctionalEvent } from './event-builder';

describe('EventBuilder', () => {
  describe('Basic Event Creation', () => {
    it('should create an event with no modifiers', () => {
      const event = EventBuilder.create().name('Test Event').description('A test event').build();

      expect(event).toBeDefined();
      expect(event.name).toBe('Test Event');
      expect(event.description).toBe('A test event');
    });

    it('should throw error if name is missing', () => {
      expect(() => {
        EventBuilder.create().description('A test event').build();
      }).toThrow('Event name is required');
    });

    it('should throw error if description is missing', () => {
      expect(() => {
        EventBuilder.create().name('Test Event').build();
      }).toThrow('Event description is required');
    });
  });

  describe('Pokemon Modifiers', () => {
    it('should create an event with Pokemon modifier', () => {
      const eventFactory = EventBuilder.create()
        .name('Pokemon Event')
        .description('Modifies Pokemon')
        .forPokemon((_, _pokemon) => ({
          'pokemon.frequency': (freq) => freq * 0.9
        }))
        .build();

      // With modifiers, build() returns a function for void input
      expect(eventFactory).toBeDefined();
      expect(typeof eventFactory).toBe('function');

      const event = (eventFactory as unknown as () => FunctionalEvent)();
      expect(event.name).toBe('Pokemon Event');
    });

    it('should apply Pokemon modifier correctly', () => {
      const eventFactory = EventBuilder.create()
        .name('Frequency Buff')
        .description('Reduces frequency by 10%')
        .forPokemon((_, _pokemon) => ({
          'pokemon.frequency': (freq) => freq * 0.9
        }))
        .build();

      // For void input with modifiers, we get a function that we need to call
      const event = (eventFactory as unknown as () => FunctionalEvent)();

      const mockPokemon = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({ frequency: 1000 })
      });

      const result = event.applyToPokemon(mockPokemon);
      expect(result.pokemon.frequency).toBe(900);
    });

    it('should support conditional logic in Pokemon modifiers', () => {
      const eventFactory = EventBuilder.create()
        .name('Berry Specialist Buff')
        .description('Buffs berry specialists')
        .forPokemon((_, pokemon) => ({
          'pokemon.frequency': (freq) => {
            if (pokemon.pokemon.specialty === 'berry') {
              return freq * 0.8;
            }
            return freq;
          }
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();

      const berrySpecialist = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({ frequency: 1000, specialty: 'berry' })
      });

      const nonBerrySpecialist = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({ frequency: 1000, specialty: 'ingredient' })
      });

      const result1 = event.applyToPokemon(berrySpecialist);
      expect(result1.pokemon.frequency).toBe(800);

      const result2 = event.applyToPokemon(nonBerrySpecialist);
      expect(result2.pokemon.frequency).toBe(1000);
    });

    it('should support direct value assignment', () => {
      const eventFactory = EventBuilder.create()
        .name('Set Skill Level')
        .description('Sets skill level to 10')
        .forPokemon((_, _pokemon) => ({
          skillLevel: 10
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();

      const mockPokemon = commonMocks.pokemonInstance({ skillLevel: 5 });

      const result = event.applyToPokemon(mockPokemon);
      expect(result.skillLevel).toBe(10);
    });
  });

  describe('Team Modifiers', () => {
    it('should create an event with Team modifier', () => {
      const eventFactory = EventBuilder.create()
        .name('Team Event')
        .description('Modifies Team')
        .forTeam((_, _member) => ({
          'settings.skillLevel': (level) => level + 1
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();
      expect(event).toBeDefined();
      expect(event.name).toBe('Team Event');
    });

    it('should apply Team modifier correctly', () => {
      const eventFactory = EventBuilder.create()
        .name('Skill Boost')
        .description('Increases skill level by 1')
        .forTeam((_, _member) => ({
          'settings.skillLevel': (level) => level + 1
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();

      const mockMember = commonMocks.teamMember({
        settings: commonMocks.teamMemberSettings({ skillLevel: 5 })
      });

      const result = event.applyToTeam(mockMember);
      expect(result.settings.skillLevel).toBe(6);
    });

    it('should support nested path modifications', () => {
      const eventFactory = EventBuilder.create()
        .name('Frequency Modifier')
        .description('Modifies nested frequency')
        .forTeam((_, _member) => ({
          'pokemonWithIngredients.pokemon.frequency': (freq) => freq * 0.9
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();

      const mockMember = commonMocks.teamMember({
        pokemonWithIngredients: commonMocks.pokemonWithIngredients({
          pokemon: commonMocks.mockPokemon({ frequency: 1000 })
        })
      });

      const result = event.applyToTeam(mockMember);
      expect(result.pokemonWithIngredients.pokemon.frequency).toBe(900);
    });
  });

  describe('Strength Modifiers', () => {
    it('should create an event with Strength modifier', () => {
      const eventFactory = EventBuilder.create()
        .name('Strength Event')
        .description('Modifies Strength')
        .forStrength((_, _strength) => ({
          'berries.breakdown.favored': (value) => value * 2
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();
      expect(event).toBeDefined();
      expect(event.name).toBe('Strength Event');
    });
  });

  describe('Parameterized Events', () => {
    it('should create parameterized event with input', () => {
      const eventFactory = EventBuilder.create<{ multiplier: number }>()
        .name('Dynamic Event')
        .description('Uses input parameter')
        .forPokemon((input, _pokemon) => ({
          'pokemon.frequency': (freq) => freq * input.multiplier
        }))
        .build();

      const event1 = eventFactory({ multiplier: 0.8 });
      const event2 = eventFactory({ multiplier: 0.9 });

      expect(event1.name).toBe('Dynamic Event');
      expect(event2.name).toBe('Dynamic Event');

      const mockPokemon = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({ frequency: 1000 })
      });

      const result1 = event1.applyToPokemon(mockPokemon);
      expect(result1.pokemon.frequency).toBe(800);

      const result2 = event2.applyToPokemon(mockPokemon);
      expect(result2.pokemon.frequency).toBe(900);
    });

    it('should create realistic Greengrass Island expert mode event', () => {
      const expertModeEventFactory = EventBuilder.create<ExpertModeSettings>()
        .name('Expert Mode Event')
        .description('Dynamic event based on input parameters')

        .forPokemon((input, pokemon) => ({
          // Main berry gets frequency buff
          'pokemon.frequency': (freq) => {
            if (pokemon.pokemon.berry.name === input.mainFavoriteBerry.name) {
              return freq * 0.9;
            }
            return freq;
          },

          // Skill level boost with max constraint
          skillLevel: (level) => {
            if (pokemon.pokemon.berry.name === input.mainFavoriteBerry.name) {
              const maxLevel = pokemon.pokemon.skill.maxLevel;
              return Math.min(level + 1, maxLevel);
            }
            return level;
          },

          // Skill percentage boost based on random bonus
          'pokemon.skillPercentage': (percentage) => {
            const favoredBerries = [input.mainFavoriteBerry, ...input.subFavoriteBerries].map((b) => b.name);
            const isFavoredBerry = favoredBerries.includes(pokemon.pokemon.berry.name);

            if (isFavoredBerry && input.randomBonus === 'skill') {
              return percentage * 1.25;
            }
            return percentage;
          }
        }))

        .build();

      const settings: ExpertModeSettings = {
        mainFavoriteBerry: MAGO,
        subFavoriteBerries: [ORAN, SITRUS],
        randomBonus: 'skill'
      };

      const event = expertModeEventFactory(settings);

      expect(event.name).toBe('Expert Mode Event');
      expect(event.description).toBe('Dynamic event based on input parameters');

      // Create a skill with maxLevel 10 (RP array length determines maxLevel)
      const skillWithMaxLevel10 = new (class extends Mainskill {
        name = 'mock skill';
        description = (params: AmountParams) => `mock skill with level ${params.skillLevel}`;
        amount = (_skillLevel: number) => 0;
        RP = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
        unit = 'mock unit';
        activations = {};
        image = 'mock';
      })(false, true);

      // Test with MAGO berry (main favorite)
      const magoPokemon = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({
          berry: MAGO,
          frequency: 1000,
          skillPercentage: 100,
          skill: skillWithMaxLevel10
        }),
        skillLevel: 5
      });

      const result = event.applyToPokemon(magoPokemon);
      expect(result.pokemon.frequency).toBe(900); // 10% buff
      expect(result.skillLevel).toBe(6); // +1 level
      expect(result.pokemon.skillPercentage).toBe(125); // 25% boost

      // Test with non-favored berry (ORAN is in subFavoriteBerries, so use BELUE which is not favored)
      const otherPokemon = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({
          berry: commonMocks.mockPokemon().berry, // Use BELUE (default mock berry) which is not in favored list
          frequency: 1000,
          skillPercentage: 100,
          skill: skillWithMaxLevel10
        }),
        skillLevel: 5
      });

      const result2 = event.applyToPokemon(otherPokemon);
      expect(result2.pokemon.frequency).toBe(1000); // No buff
      expect(result2.skillLevel).toBe(5); // No level increase
      expect(result2.pokemon.skillPercentage).toBe(100); // No boost
    });
  });

  describe('Multiple Modifiers', () => {
    it('should support multiple modifier types in one event', () => {
      const eventFactory = EventBuilder.create()
        .name('Multi-Type Event')
        .description('Modifies multiple types')
        .forPokemon((_, _pokemon) => ({
          'pokemon.frequency': (freq) => freq * 0.9
        }))
        .forTeam((_, _member) => ({
          'settings.skillLevel': (level) => level + 1
        }))
        .forStrength((_, _strength) => ({
          'berries.breakdown.favored': (value) => value * 2
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();
      expect(event).toBeDefined();
      expect(event.name).toBe('Multi-Type Event');
    });

    it('should apply multiple modifiers to same type', () => {
      const eventFactory = EventBuilder.create()
        .name('Multiple Pokemon Modifiers')
        .description('Applies multiple modifiers')
        .forPokemon((_, _pokemon) => ({
          'pokemon.frequency': (freq) => freq * 0.9,
          skillLevel: (level) => level + 1
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();

      const mockPokemon = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({ frequency: 1000 }),
        skillLevel: 5
      });

      const result = event.applyToPokemon(mockPokemon);
      expect(result.pokemon.frequency).toBe(900);
      expect(result.skillLevel).toBe(6);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original object', () => {
      const eventFactory = EventBuilder.create()
        .name('Immutable Event')
        .description('Does not mutate')
        .forPokemon((_, _pokemon) => ({
          'pokemon.frequency': (freq) => freq * 0.5
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();

      const original = commonMocks.pokemonInstance({
        pokemon: commonMocks.mockPokemon({ frequency: 1000 })
      });

      const result = event.applyToPokemon(original);

      expect(original.pokemon.frequency).toBe(1000); // Original unchanged
      expect(result.pokemon.frequency).toBe(500); // Result modified
      expect(result).not.toBe(original); // Different object
    });
  });

  describe('Static Factory Pattern', () => {
    it('should create instance via static create method', () => {
      const builder = EventBuilder.create<{ value: number }>();
      expect(builder).toBeDefined();
      expect(builder.name).toBeDefined();
      expect(builder.description).toBeDefined();
      expect(builder.forPokemon).toBeDefined();
      expect(builder.forTeam).toBeDefined();
      expect(builder.forStrength).toBeDefined();
      expect(builder.build).toBeDefined();
    });

    it('should support method chaining', () => {
      const eventFactory = EventBuilder.create()
        .name('Chained Event')
        .description('Uses method chaining')
        .forPokemon((_, _pokemon) => ({
          'pokemon.frequency': (freq) => freq * 0.9
        }))
        .forTeam((_, _member) => ({
          'settings.skillLevel': (level) => level + 1
        }))
        .build();

      const event = (eventFactory as unknown as () => FunctionalEvent)();
      expect(event.name).toBe('Chained Event');
    });
  });
});
