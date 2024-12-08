import { mockBedtime, mockWakeup } from '@src/vitest/mocks/time/mock-time.js';
import { TeamSettingsExt } from 'sleepapi-common';

export function mockTeamSettingsExt(attrs?: Partial<TeamSettingsExt>): TeamSettingsExt {
  return {
    bedtime: mockBedtime(),
    wakeup: mockWakeup(),
    camp: false,
    ...attrs
  };
}
