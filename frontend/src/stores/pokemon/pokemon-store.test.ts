import { UserService } from '@/services/user/user-service'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { createMockMemberProduction, createMockPokemon } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    getUserPokemon: vi.fn(),
    upsertPokemon: vi.fn(),
    deletePokemon: vi.fn()
  }
}))

describe('Pokemon Store', () => {
  const externalId = 'external-id'
  const mockPokemon = createMockPokemon({ externalId, saved: false })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have expected default state', () => {
    const pokemonStore = usePokemonStore()
    expect(pokemonStore.$state).toMatchInlineSnapshot(`
      {
        "pokemon": {},
      }
    `)
  })

  it('should upsert a pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })
  })

  it('should update an existing pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    const updatedPokemon = { ...mockPokemon, name: 'Raichu' }
    pokemonStore.upsertLocalPokemon(updatedPokemon)

    expect(pokemonStore.pokemon).toEqual({
      'external-id': updatedPokemon
    })
  })

  it('should remove a pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })

    pokemonStore.removePokemon(externalId, 'pokebox')
    expect(pokemonStore.pokemon).toEqual({})
  })

  it('should not remove a pokemon if it is saved', () => {
    const pokemonStore = usePokemonStore()
    const savedMon = { ...mockPokemon, saved: true }
    pokemonStore.upsertLocalPokemon(savedMon)

    expect(pokemonStore.pokemon).toEqual({
      'external-id': savedMon
    })

    pokemonStore.removePokemon(externalId, 'pokebox')
    expect(pokemonStore.pokemon).toEqual({
      'external-id': savedMon
    })
  })

  it('should not remove a pokemon if it is used in a team', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, { members: [mockPokemon.externalId] })

    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })

    pokemonStore.removePokemon(externalId, 'pokebox')
    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })
  })

  it('should not remove a pokemon if it is used in compare cache', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(createMockMemberProduction())

    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })

    pokemonStore.removePokemon(externalId, 'pokebox')
    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })
  })

  it('should get a pokemon by externalId correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    const retrievedPokemon = pokemonStore.getPokemon(externalId)
    expect(retrievedPokemon).toEqual(mockPokemon)
  })

  it('should return undefined for a non-existent pokemon', () => {
    const pokemonStore = usePokemonStore()

    const retrievedPokemon = pokemonStore.getPokemon('non-existent-id')
    expect(retrievedPokemon).toBeUndefined()
  })

  it('should call server to upsert pokemon if user logged in', async () => {
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    userStore.setTokens({ accessToken: '', expiryDate: 0, refreshToken: '' })

    UserService.upsertPokemon = vi.fn().mockResolvedValue({})

    pokemonStore.upsertServerPokemon(mockPokemon)

    expect(UserService.upsertPokemon).toHaveBeenCalled()
  })

  it('should call server to delete pokemon if user logged in', async () => {
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    userStore.setTokens({ accessToken: '', expiryDate: 0, refreshToken: '' })

    UserService.deletePokemon = vi.fn().mockResolvedValue({})

    pokemonStore.deleteServerPokemon(mockPokemon.externalId)

    expect(UserService.deletePokemon).toHaveBeenCalled()
  })
})
