import type { TeamMemberSettings, TeamMemberSettingsExt, TeamMemberSettingsResult } from 'sleepapi-common';
import { nature } from 'sleepapi-common';

export function teamMemberSettings(attrs?: Partial<TeamMemberSettings>): TeamMemberSettings {
  return {
    carrySize: 0,
    externalId: 'mock id',
    level: 0,
    nature: nature.BASHFUL.name,
    ribbon: 0,
    skillLevel: 0,
    subskills: [],
    ...attrs
  };
}

export function teamMemberSettingsExt(attrs?: Partial<TeamMemberSettingsExt>): TeamMemberSettingsExt {
  return {
    carrySize: 0,
    externalId: 'mock id',
    level: 0,
    nature: nature.BASHFUL,
    ribbon: 0,
    skillLevel: 0,
    subskills: new Set(),
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
    ...attrs
  };
}
