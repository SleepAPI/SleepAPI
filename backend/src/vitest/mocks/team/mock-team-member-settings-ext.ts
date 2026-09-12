import type { TeamMemberSettings, TeamMemberSettingsDto, TeamMemberSettingsResult } from 'sleepapi-common';
import { nature } from 'sleepapi-common';

export function teamMemberSettingsDto(attrs?: Partial<TeamMemberSettingsDto>): TeamMemberSettingsDto {
  return {
    carrySize: 0,
    externalId: 'mock id',
    level: 0,
    nature: nature.BASHFUL.name,
    ribbon: 0,
    skillLevel: 0,
    subskills: [],
    sneakySnacking: false,
    ...attrs
  };
}

export function teamMemberSettings(attrs?: Partial<TeamMemberSettings>): TeamMemberSettings {
  return {
    carrySize: 1,
    externalId: 'mock id',
    level: 1,
    nature: nature.BASHFUL,
    ribbon: 0,
    skillLevel: 1,
    subskills: new Set(),
    sneakySnacking: false,
    ...attrs
  };
}

export function teamMemberSettingsResult(attrs?: Partial<TeamMemberSettingsResult>): TeamMemberSettingsResult {
  return {
    carrySize: 0,
    externalId: 'mock id',
    level: 0,
    nature: nature.BASHFUL,
    ribbon: 0,
    skillLevel: 0,
    subskills: [],
    sneakySnacking: false,
    ...attrs
  };
}
