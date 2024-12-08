import { nature, TeamMemberSettings, TeamMemberSettingsExt } from 'sleepapi-common';

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
