import type { Area } from '../../types';

const RANK_NAMES = ['Basic', 'Great', 'Ultra', 'Master'];

export function rankForStrength(strength: number, area: Area): string {
  const rankIndex = area.rankThresholds.findLastIndex((threshold) => threshold <= strength);
  const titleIndex = Math.min(Math.floor(rankIndex / 5), RANK_NAMES.length - 1);
  const rankNumber = rankIndex - 5 * titleIndex + 1;

  return `${RANK_NAMES[titleIndex]} ${rankNumber}`;
}
