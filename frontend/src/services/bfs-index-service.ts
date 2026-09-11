import { COMPLETE_POKEDEX, type Pokemon } from 'sleepapi-common'

export const BFS_INDEX_SOURCE =
  'https://www.reddit.com/r/PokemonSleep/comments/1m9nnh3/bfs_value_on_nonberry_mons_numerically_indexed/'

export interface BfsIndexEntry {
  pokemon: Pokemon
  score: number
}

export interface BfsIndexRow {
  min: number
  max: number
  entries: BfsIndexEntry[]
}

/** Truncate display labels; sorting and range placement retain full precision. */
export function formatBfsIndex(score: number): string {
  return (Math.trunc(score * 100) / 100).toFixed(2)
}

/** VelocityRaptor22's index uses base frequency in seconds and ingredient rate as a fraction.
 * Ingredient Finder M, when enabled, applies only to ingredient specialists; all specialists use the skill formula.
 */
export function calculateBfsIndex(pokemon: Pokemon, ingredientFinderM = true): number {
  const ingredientMultiplier = pokemon.specialty === 'ingredient' && ingredientFinderM ? 1.36 : 1
  const ingredientRate = (pokemon.ingredientPercentage / 100) * ingredientMultiplier
  return (864 / pokemon.frequency) * (1 - ingredientRate) * pokemon.berry.value
}

export function buildBfsIndexRows(
  pokedex: readonly Pokemon[] = COMPLETE_POKEDEX,
  {
    includeUnevolved = false,
    ingredientFinderM = true
  }: { includeUnevolved?: boolean; ingredientFinderM?: boolean } = {}
): BfsIndexRow[] {
  const entries = pokedex
    .filter((pokemon) => pokemon.specialty !== 'berry' && (includeUnevolved || pokemon.remainingEvolutions === 0))
    .map((pokemon) => ({ pokemon, score: calculateBfsIndex(pokemon, ingredientFinderM) }))
    .sort((a, b) => b.score - a.score || a.pokemon.name.localeCompare(b.pokemon.name))

  if (entries.length === 0) return []

  // Bucket the full-precision score before formatting, retaining empty intervening ranges.
  const highestBucket = Math.floor(entries[0].score * 2)
  const lowestBucket = Math.floor(entries[entries.length - 1].score * 2)
  const rows: BfsIndexRow[] = Array.from({ length: highestBucket - lowestBucket + 1 }, (_, index) => ({
    min: (highestBucket - index) / 2,
    max: (highestBucket - index + 1) / 2,
    entries: []
  }))
  for (const entry of entries) {
    rows[highestBucket - Math.floor(entry.score * 2)].entries.push(entry)
  }
  return rows
}
