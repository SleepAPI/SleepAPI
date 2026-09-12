import type { ExpertModeSettings, TeamMember } from '../../types';
import { EventBuilder } from '../builders/event-builder';

function isMainBerry(input: ExpertModeSettings, member: TeamMember) {
  return input.mainFavoriteBerry.name === member.pokemonWithIngredients.pokemon.berry.name;
}

function isFavoredBerry(input: ExpertModeSettings, member: TeamMember) {
  const berryName = member.pokemonWithIngredients.pokemon.berry.name;
  return input.mainFavoriteBerry.name === berryName || input.subFavoriteBerries.some((b) => b.name === berryName);
}

export const greengrassExpertMode = EventBuilder.create<ExpertModeSettings>()
  .name('Greengrass Expert Mode Event')
  .description('Dynamic event based on input parameters')

  .forTeam((input, member) => ({
    'pokemonWithIngredients.pokemon.frequency': (freq) => {
      if (isMainBerry(input, member)) {
        return freq * 0.9;
      }
      if (isFavoredBerry(input, member)) {
        return freq;
      }
      return freq * 1.15;
    },

    'settings.skillLevel': (level) => {
      if (isMainBerry(input, member)) {
        const maxLevel = member.pokemonWithIngredients.pokemon.skill.maxLevel;
        return Math.min(level + 1, maxLevel);
      }
      return level;
    },

    'pokemonWithIngredients.pokemon.skillPercentage': (percentage) => {
      if (isFavoredBerry(input, member) && input.randomBonus === 'skill') {
        return percentage * 1.25;
      }
      return percentage;
    }
  }))

  // The weekly 'berry' bonus (favored berries 2.4x instead of 2x) is applied in the
  // backend StrengthCalculator, where it can compound with the area bonus and also
  // cover berries produced by skills like Berry Burst.
  .build();
