import { bedtime, wakeup } from '@src/bun/mocks/time/mock-time.js';
import type { TeamSettingsExt } from 'sleepapi-common';

export function teamSettingsExt(attrs?: Partial<TeamSettingsExt>): TeamSettingsExt {
  return {
    bedtime: bedtime(),
    wakeup: wakeup(),
    camp: false,
    ...attrs
  };
}
