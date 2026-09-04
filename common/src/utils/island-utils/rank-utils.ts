import type { Area } from '../../types';

const RANK_NAMES = ['Basic', 'Great', 'Ultra', 'Master'];

export function rankForProjectedStrength(projectedStrength: number, area: Area): string {
  const rankIndex = area.rankThresholds.findLastIndex((threshold) => threshold <= projectedStrength);
  const titleIndex = Math.min(Math.floor(rankIndex / 5), RANK_NAMES.length - 1);
  const rankNumber = titleIndex < 3 ? (rankIndex % 5) + 1 : rankIndex - 14;

  return `${RANK_NAMES[titleIndex]} ${rankNumber}`;
}
