import type { MemberStrength, PokemonInstance, TeamMember } from '../../types';
import type { PathValue } from '../../types/type/path-value';
import type { PathKeys } from '../../types/type/type-paths';

export interface FunctionalEvent {
  name: string;
  description: string;
  applyToPokemon: (target: PokemonInstance) => PokemonInstance;
  applyToTeam: (target: TeamMember) => TeamMember;
  applyToStrength: (target: MemberStrength) => MemberStrength;
}

/**
 * Modifier function that transforms a value
 */
type ModifierFn<T, P extends PathKeys<T>> = (currentValue: PathValue<T, P>, target: T) => PathValue<T, P>;

/**
 * Path as the key and either a function or a direct value as the value
 */
type ModifierMap<T> = {
  [P in PathKeys<T>]?: ModifierFn<T, P> | PathValue<T, P>;
};

export class EventBuilder<TInput = void> {
  private eventName?: string;
  private eventDescription?: string;

  private pokemonModifiers: Array<(input: TInput, target: PokemonInstance) => Record<string, unknown>> = [];
  private teamModifiers: Array<(input: TInput, target: TeamMember) => Record<string, unknown>> = [];
  private strengthModifiers: Array<(input: TInput, target: MemberStrength) => Record<string, unknown>> = [];

  /**
   * Create a new EventBuilder instance
   *
   * @example
   * const event = EventBuilder.create<MyInput>()
   *   .name('My Event')
   *   .description('Description')
   *   .forTeam((input, member) => ({ ... }))
   *   .build();
   */
  static create<TInput = void>(): EventBuilder<TInput> {
    return new EventBuilder<TInput>();
  }

  name(name: string): this {
    this.eventName = name;
    return this;
  }

  description(description: string): this {
    this.eventDescription = description;
    return this;
  }

  /**
   * Add Pokemon modifiers
   *
   * @example
   * .forPokemon((input, pokemon) => ({
   *   'pokemon.frequency': (freq) => freq * 0.9,
   *   'skillLevel': (level) => level + 1
   * }))
   */
  forPokemon(factory: (input: TInput, target: PokemonInstance) => ModifierMap<PokemonInstance>): this {
    this.pokemonModifiers.push((input, target) => factory(input, target));
    return this;
  }

  /**
   * Add Team modifiers
   *
   * @example
   * .forTeam((input, member) => ({
   *   'settings.skillLevel': (level) => level + 1,
   *   'pokemonWithIngredients.pokemon.frequency': (freq) => freq * 0.9,
   * }))
   */
  forTeam(factory: (input: TInput, target: TeamMember) => ModifierMap<TeamMember>): this {
    this.teamModifiers.push((input, target) => factory(input, target));
    return this;
  }

  /**
   * Add Strength modifiers
   *
   * @example
   * .forStrength((input, strength) => ({
   *   'berries.breakdown.favored': (value) => value * 2.4
   * }))
   */
  forStrength(factory: (input: TInput, target: MemberStrength) => ModifierMap<MemberStrength>): this {
    this.strengthModifiers.push((input, target) => factory(input, target));
    return this;
  }

  /**
   * Compile the event
   */
  build(): TInput extends void ? FunctionalEvent : (input: TInput) => FunctionalEvent {
    if (!this.eventName) {
      throw new Error('Event name is required');
    }
    if (!this.eventDescription) {
      throw new Error('Event description is required');
    }

    // TODO: we would like to make modifiers more generic, and thus also not needing to check for modifiers here
    const hasModifiers =
      this.pokemonModifiers.length > 0 || this.teamModifiers.length > 0 || this.strengthModifiers.length > 0;

    if (!hasModifiers) {
      const noOpEvent: FunctionalEvent = {
        name: this.eventName,
        description: this.eventDescription,
        applyToPokemon: (p: PokemonInstance) => p,
        applyToTeam: (t: TeamMember) => t,
        applyToStrength: (s: MemberStrength) => s
      };
      return noOpEvent as TInput extends void ? FunctionalEvent : (input: TInput) => FunctionalEvent;
    }

    const eventFactory = (input: TInput): FunctionalEvent => {
      return {
        name: this.eventName!,
        description: this.eventDescription!,

        applyToPokemon: (target: PokemonInstance): PokemonInstance => {
          let result = target;
          for (const factory of this.pokemonModifiers) {
            result = this.applyModifierMap(result, factory(input, result));
          }
          return result;
        },

        applyToTeam: (target: TeamMember): TeamMember => {
          let result = target;
          for (const factory of this.teamModifiers) {
            result = this.applyModifierMap(result, factory(input, result));
          }
          return result;
        },

        applyToStrength: (target: MemberStrength): MemberStrength => {
          let result = target;
          for (const factory of this.strengthModifiers) {
            result = this.applyModifierMap(result, factory(input, result));
          }
          return result;
        }
      };
    };

    return eventFactory as TInput extends void ? FunctionalEvent : (input: TInput) => FunctionalEvent;
  }

  private applyModifierMap<T>(target: T, modifierMap: Record<string, unknown>): T {
    let result = { ...target };

    for (const [path, spec] of Object.entries(modifierMap)) {
      if (spec === undefined) continue;

      const currentValue = this.getValueAtPath(target, path);
      if (currentValue === undefined) continue;

      let newValue: unknown;

      if (typeof spec === 'function') {
        newValue = spec(currentValue, target);
      } else {
        newValue = spec;
      }

      result = this.setValueAtPath(result, path, newValue);
    }

    return result;
  }

  private getValueAtPath(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      const currentObj = current as Record<string, unknown>;
      current = currentObj[part];
    }

    return current;
  }

  private setValueAtPath<T>(obj: T, path: string, value: unknown): T {
    const parts = path.split('.');

    if (parts.length === 1) {
      return { ...obj, [parts[0]]: value };
    }

    const [firstPart, ...restPath] = parts;
    const restPathStr = restPath.join('.');

    const objAsRecord = obj as Record<string, unknown>;
    return {
      ...obj,
      [firstPart]: this.setValueAtPath(objAsRecord[firstPart], restPathStr, value)
    };
  }
}
