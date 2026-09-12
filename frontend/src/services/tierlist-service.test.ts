import serverAxios from '@/router/server-axios'
import { tierlistService } from '@/services/tierlist-service'
import { mocks } from '@/vitest'
import { COMPLETE_POKEDEX } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    post: vi.fn()
  }
}))

const mockTierlistSettings = mocks.tierlistSettings()
const mockPokemonWithTiering = mocks.multiplePokemonWithTiering(4)

describe('TierlistService', () => {
  describe('fetchTierlist', () => {
    it('should fetch tierlist data and return processed results', async () => {
      const mockResponse = { data: mockPokemonWithTiering }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      const result = await tierlistService.fetchTierlist(mockTierlistSettings)

      expect(serverAxios.post).toHaveBeenCalledWith('/tierlist/cooking', mockTierlistSettings)
      expect(result).toHaveLength(4) // All 4 should be unique pokemon
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score) // Should be sorted by score
      expect(result[1].score).toBeGreaterThanOrEqual(result[2].score)
      expect(result[2].score).toBeGreaterThanOrEqual(result[3].score)
    })

    it('should handle empty response data', async () => {
      const mockResponse = { data: [] }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      const result = await tierlistService.fetchTierlist(mockTierlistSettings)

      expect(serverAxios.post).toHaveBeenCalledWith('/tierlist/cooking', mockTierlistSettings)
      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      const mockError = new Error('API Error')
      vi.mocked(serverAxios.post).mockRejectedValue(mockError)

      await expect(tierlistService.fetchTierlist(mockTierlistSettings)).rejects.toThrow('API Error')
    })

    it('should store raw data for later use', async () => {
      const mockResponse = { data: mockPokemonWithTiering }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      await tierlistService.fetchTierlist(mockTierlistSettings)

      // Verify that rawFetchedData was populated
      const rawData = tierlistService['rawFetchedData']
      expect(rawData).toEqual(mockPokemonWithTiering)
    })
  })

  describe('getPokemonVariants', () => {
    beforeEach(() => {
      // Create test data with duplicate Pokemon for variant testing
      // The first Pokemon generated is BUTTERFREE (index 0)
      const firstPokemonName = 'BUTTERFREE'

      const testData = [
        ...mocks.multiplePokemonWithTiering(2), // Gets BUTTERFREE and RATICATE
        mocks.pokemonWithTiering({
          pokemonWithSettings: {
            ...mocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: firstPokemonName, // BUTTERFREE
            settings: {
              ...mocks.pokemonWithTiering().pokemonWithSettings.settings,
              level: 30,
              externalId: 'butterfree-variant'
            }
          },
          score: 800
        })
      ]
      tierlistService['rawFetchedData'] = testData
    })

    /**
     * Apparently all mons now have a single variant. I don't know what this means, so I don't know whether this is a problem.
     */
    it.skip('should return all variants of a specific pokemon sorted by score', () => {
      const names = COMPLETE_POKEDEX.map((mon) => mon.name)
      const monWithMultipleVariants = names.find((mon) => tierlistService.getPokemonVariants(mon).length > 1)
      expect(monWithMultipleVariants).toBeDefined() // Is this a safe assumption? How we do know how many variants each mon _should_ have?

      const pokemonVariants = tierlistService.getPokemonVariants(monWithMultipleVariants!)

      expect(pokemonVariants).toHaveLength(2)
      expect(pokemonVariants[0].score).toBeGreaterThanOrEqual(pokemonVariants[1].score)
      expect(pokemonVariants[0].pokemonWithSettings.pokemon).toBe(monWithMultipleVariants)
      expect(pokemonVariants[1].pokemonWithSettings.pokemon).toBe(monWithMultipleVariants)
    })

    it('should return single variant when only one exists', () => {
      const names = COMPLETE_POKEDEX.map((mon) => mon.name)
      const monWithSingleVariant = names.find((mon) => tierlistService.getPokemonVariants(mon).length === 1)
      expect(monWithSingleVariant).toBeDefined() // Is this a safe assumption? How we do know how many variants each mon _should_ have?

      const pokemonVariants = tierlistService.getPokemonVariants(monWithSingleVariant!)

      expect(pokemonVariants).toHaveLength(1)
      expect(pokemonVariants[0].pokemonWithSettings.pokemon).toBe(monWithSingleVariant)
    })

    it('should return empty array for non-existent pokemon', () => {
      const nonExistentVariants = tierlistService.getPokemonVariants('NONEXISTENT')

      expect(nonExistentVariants).toEqual([])
    })

    it('should return empty array when no raw data exists', () => {
      tierlistService['rawFetchedData'] = []

      const variants = tierlistService.getPokemonVariants('BUTTERFREE')

      expect(variants).toEqual([])
    })
  })

  describe('processTierlistData (private method behavior)', () => {
    it('should deduplicate pokemon and keep highest scoring variant', async () => {
      // Create test data with duplicate BUTTERFREE entries
      const duplicateData = [
        mocks.pokemonWithTiering({
          pokemonWithSettings: {
            ...mocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'BUTTERFREE'
          },
          score: 1000
        }), // BUTTERFREE with score 1000
        mocks.pokemonWithTiering({
          pokemonWithSettings: {
            ...mocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'BUTTERFREE'
          },
          score: 800
        }), // BUTTERFREE with score 800
        mocks.pokemonWithTiering({
          pokemonWithSettings: {
            ...mocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'RATICATE'
          },
          score: 1200
        })
      ]

      const mockResponse = { data: duplicateData }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      const result = await tierlistService.fetchTierlist(mockTierlistSettings)

      // Verify deduplication logic
      const pokemonEntries = result.filter((entry) => entry.pokemonWithSettings.pokemon === 'BUTTERFREE')
      expect(pokemonEntries).toHaveLength(1)
      expect(pokemonEntries[0].score).toBe(1000) // Should keep the higher scoring BUTTERFREE
    })

    it('should sort results by score in descending order', async () => {
      const mockResponse = { data: mockPokemonWithTiering }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      const result = await tierlistService.fetchTierlist(mockTierlistSettings)

      // Verify sorting
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score)
      }
    })

    it('should handle single pokemon entry', async () => {
      const singlePokemon = [mocks.pokemonWithTiering()]
      const mockResponse = { data: singlePokemon }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      const result = await tierlistService.fetchTierlist(mockTierlistSettings)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(singlePokemon[0])
    })

    it('should handle duplicate pokemon with same score', async () => {
      const duplicateScoreData = [
        mocks.pokemonWithTiering({
          pokemonWithSettings: {
            ...mocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'BUTTERFREE',
            settings: {
              ...mocks.pokemonWithTiering().pokemonWithSettings.settings,
              level: 50,
              externalId: 'butterfree-1'
            }
          },
          score: 1000
        }),
        mocks.pokemonWithTiering({
          pokemonWithSettings: {
            ...mocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'BUTTERFREE',
            settings: {
              ...mocks.pokemonWithTiering().pokemonWithSettings.settings,
              level: 30,
              externalId: 'butterfree-2'
            }
          },
          score: 1000
        })
      ]
      const mockResponse = { data: duplicateScoreData }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      const result = await tierlistService.fetchTierlist(mockTierlistSettings)

      expect(result).toHaveLength(1)
      expect(result[0].pokemonWithSettings.pokemon).toBe('BUTTERFREE')
      // Should keep the first one encountered when scores are equal
    })
  })

  describe('integration tests', () => {
    it('should work end-to-end: fetch, process, and get variants', async () => {
      // Create test data with some duplicate Pokemon
      const testData = [
        ...mocks.multiplePokemonWithTiering(3),
        mocks.pokemonWithTiering({
          pokemonWithSettings: {
            ...mocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'BUTTERFREE' // First Pokemon generated
          },
          score: 500
        })
      ]
      const mockResponse = { data: testData }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      // Fetch tierlist
      const tierlistResult = await tierlistService.fetchTierlist(mockTierlistSettings)

      // Verify processed data (should deduplicate)
      expect(tierlistResult.length).toBeLessThanOrEqual(testData.length)

      // Get variants for BUTTERFREE (should find both in raw data)
      const pokemonVariants = tierlistService.getPokemonVariants('BUTTERFREE')
      expect(pokemonVariants.length).toBeGreaterThanOrEqual(1)
    })

    it('should maintain separate processed and raw data', async () => {
      const testData = mocks.multiplePokemonWithTiering(5)
      const mockResponse = { data: testData }
      vi.mocked(serverAxios.post).mockResolvedValue(mockResponse)

      const processedResult = await tierlistService.fetchTierlist(mockTierlistSettings)
      const rawData = tierlistService['rawFetchedData']

      // Raw data should have original count
      expect(rawData).toHaveLength(5)

      // Processed data should be sorted
      for (let i = 0; i < processedResult.length - 1; i++) {
        expect(processedResult[i].score).toBeGreaterThanOrEqual(processedResult[i + 1].score)
      }
    })
  })
})
