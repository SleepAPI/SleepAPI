import type { TeamSettings, TeamSettingsDto } from '../../../types/team/team';
import { mockIngredientSetFloatIndexed } from '../ingredient/mock-ingredient-set';
import { islandInstance } from '../island';
import { bedtime, wakeup } from '../time';

export function teamSettingsDto(attrs?: Partial<TeamSettingsDto>): TeamSettingsDto {
  return {
    camp: false,
    bedtime: '21:30',
    wakeup: '06:00',
    stockpiledIngredients: [],
    island: islandInstance(),
    ...attrs
  };
}

export function teamSettings(attrs?: Partial<TeamSettings>): TeamSettings {
  return {
    bedtime: bedtime(),
    wakeup: wakeup(),
    camp: false,
    includeCooking: false,
    stockpiledIngredients: mockIngredientSetFloatIndexed(),
    potSize: 15,
    island: islandInstance(),
    ...attrs
  };
}
