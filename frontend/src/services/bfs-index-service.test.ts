import { buildBfsIndexRows, calculateBfsIndex, formatBfsIndex } from '@/services/bfs-index-service'
import { COMPLETE_POKEDEX, type Pokemon } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

function pokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    ...COMPLETE_POKEDEX[0],
    specialty: 'skill',
    remainingEvolutions: 0,
    frequency: 3000,
    ingredientPercentage: 20,
    berry: { name: 'Test', type: 'normal', value: 30 },
    ...overrides
  }
}

describe('BFS index', () => {
  it('truncates scores to two decimal places without rounding up', () => {
    expect(formatBfsIndex(6.912)).toBe('6.91')
    expect(formatBfsIndex(5)).toBe('5.00')
    expect(formatBfsIndex(4.99968)).toBe('4.99')
    expect(formatBfsIndex(4.997309109677419)).toBe('4.99')
    expect(formatBfsIndex(3.9985920000000004)).toBe('3.99')
  })

  it('keeps every displayed score within its row for both ingredient modifier settings', () => {
    for (const ingredientFinderM of [true, false]) {
      const rows = buildBfsIndexRows(undefined, { includeUnevolved: true, ingredientFinderM })
      for (const row of rows) {
        for (const entry of row.entries) {
          const displayed = Number(formatBfsIndex(entry.score))
          expect(displayed).toBeGreaterThanOrEqual(row.min)
          expect(displayed).toBeLessThan(row.max)
        }
      }
    }
  })

  it('calculates the skill formula with ingredient percentages converted to fractions', () => {
    expect(calculateBfsIndex(pokemon())).toBeCloseTo(6.912, 10)
  })

  it('applies Ingredient Finder M only to ingredient specialists', () => {
    expect(calculateBfsIndex(pokemon({ specialty: 'ingredient' }))).toBeCloseTo(6.28992, 10)
    expect(calculateBfsIndex(pokemon({ specialty: 'all' }))).toBeCloseTo(6.912, 10)
  })

  it('disables the ingredient modifier without changing skill or all specialists', () => {
    expect(calculateBfsIndex(pokemon({ specialty: 'ingredient' }), false)).toBeCloseTo(6.912, 10)
    for (const specialty of ['skill', 'all'] as const) {
      expect(calculateBfsIndex(pokemon({ specialty }), false)).toBe(calculateBfsIndex(pokemon({ specialty })))
    }
  })

  it('excludes unevolved Pokémon by default', () => {
    const entries = buildBfsIndexRows().flatMap((row) => row.entries)
    expect(entries.map((entry) => entry.pokemon.name).sort()).toEqual(
      COMPLETE_POKEDEX.filter((entry) => entry.specialty !== 'berry' && entry.remainingEvolutions === 0)
        .map((entry) => entry.name)
        .sort()
    )
  })

  it('matches the published Sceptile benchmark', () => {
    const sceptile = COMPLETE_POKEDEX.find((entry) => entry.name === 'SCEPTILE')!
    expect(calculateBfsIndex(sceptile)).toBeCloseTo(10.06, 2)
  })

  it('includes every known non-berry specialist, including all specialists and unevolved forms', () => {
    const entries = buildBfsIndexRows(undefined, { includeUnevolved: true }).flatMap((row) => row.entries)
    const eligible = COMPLETE_POKEDEX.filter((entry) => entry.specialty !== 'berry')
    expect(entries.map((entry) => entry.pokemon.name).sort()).toEqual(eligible.map((entry) => entry.name).sort())
    expect(entries.some((entry) => entry.pokemon.specialty === 'all')).toBe(true)
    expect(entries.some((entry) => entry.pokemon.remainingEvolutions > 0)).toBe(true)
    expect(entries.every((entry) => Number.isFinite(entry.score))).toBe(true)
  })

  it('uses exact half-point boundaries before rounding and sorts descending within each row', () => {
    const atScore = (name: string, score: number) =>
      pokemon({ name, ingredientPercentage: 0, frequency: 864, berry: { name: 'Test', type: 'normal', value: score } })
    const input = [atScore('Low', 6.9999), atScore('Boundary', 7), atScore('High', 7.4999), atScore('Top', 8)]
    const original = [...input]
    const rows = buildBfsIndexRows(input)
    expect(rows.map((row) => [row.min, row.max])).toEqual([
      [8, 8.5],
      [7.5, 8],
      [7, 7.5],
      [6.5, 7]
    ])
    expect(rows.map((row) => row.entries.map((entry) => entry.pokemon.name))).toEqual([
      ['Top'],
      [],
      ['High', 'Boundary'],
      ['Low']
    ])
    expect(input).toEqual(original)
  })

  it('handles an empty Pokédex or one containing only berry specialists', () => {
    expect(buildBfsIndexRows([])).toEqual([])
    expect(buildBfsIndexRows([pokemon({ specialty: 'berry' })])).toEqual([])
  })
})
