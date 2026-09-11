import { UserService } from '@/services/user/user-service'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { commonMocks, DOMAIN_VERSION } from 'sleepapi-common'
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
  const mockPokemon = mocks.createMockPokemon({ externalId, saved: false })

  beforeEach(() => {})

  it('retains an unsaved rotation partner across cache invalidation', () => {
    const pokemon = usePokemonStore()
    pokemon.domainVersion = -1
    pokemon.upsertLocalPokemon(mockPokemon)
    useTeamStore().teams = createMockTeams(1, {
      members: [],
      schedule: [{ slotIndex: 0, externalId, startTime: '06:00' }]
    })
    pokemon.invalidateCache()
    expect(pokemon.getPokemon(externalId)).toBeDefined()
  })

  it.each(['team', 'compare', 'pokebox'] as const)('retains a rotation partner when removing its %s use', (source) => {
    const pokemon = usePokemonStore()
    pokemon.upsertLocalPokemon(mockPokemon)
    useTeamStore().teams = createMockTeams(1, {
      members: [],
      schedule: [{ slotIndex: 0, externalId, startTime: '06:00' }]
    })
    pokemon.removePokemon(externalId, source)
    expect(pokemon.getPokemon(externalId)).toBeDefined()
    useTeamStore().getCurrentTeam.schedule = []
    pokemon.removePokemon(externalId, source)
    expect(pokemon.getPokemon(externalId)).toBeUndefined()
  })

  it('should have expected default state', () => {
    const pokemonStore = usePokemonStore()
    expect(pokemonStore.$state).toMatchInlineSnapshot(`
      {
        "domainVersion": 0,
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
    comparisonStore.addMember(mocks.createMockMemberProduction())

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
    userStore.setInitialLoginData(commonMocks.loginResponse())

    UserService.upsertPokemon = vi.fn().mockResolvedValue({})

    pokemonStore.upsertServerPokemon(mockPokemon)

    expect(UserService.upsertPokemon).toHaveBeenCalled()
  })

  it('should call server to delete pokemon if user logged in', async () => {
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    UserService.deletePokemon = vi.fn().mockResolvedValue({})

    pokemonStore.deleteServerPokemon(mockPokemon.externalId)

    expect(UserService.deletePokemon).toHaveBeenCalled()
  })
  it('should not invalidate cache if domain version is current', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.domainVersion = DOMAIN_VERSION

    const unusedPokemon = mocks.createMockPokemon({ externalId: 'unused-pokemon' })
    pokemonStore.upsertLocalPokemon(unusedPokemon)

    pokemonStore.invalidateCache()

    expect(pokemonStore.pokemon).toEqual({
      'unused-pokemon': unusedPokemon
    })
  })

  it('should remove unused pokemon when domain version is outdated', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.domainVersion = -1 // outdated version

    const unusedPokemon = mocks.createMockPokemon({ externalId: 'unused-pokemon' })
    pokemonStore.upsertLocalPokemon(unusedPokemon)

    pokemonStore.invalidateCache()

    expect(pokemonStore.pokemon).toEqual({})
    expect(pokemonStore.domainVersion).toBe(DOMAIN_VERSION)
  })

  it('should keep pokemon that are used in teams during cache invalidation', () => {
    const pokemonStore = usePokemonStore()
    const teamStore = useTeamStore()
    pokemonStore.domainVersion = -1 // outdated version

    const usedPokemon = mocks.createMockPokemon({ externalId: 'used-pokemon' })
    const unusedPokemon = mocks.createMockPokemon({ externalId: 'unused-pokemon' })

    pokemonStore.upsertLocalPokemon(usedPokemon)
    pokemonStore.upsertLocalPokemon(unusedPokemon)

    teamStore.teams = createMockTeams(1, { members: [usedPokemon.externalId] })

    pokemonStore.invalidateCache()

    expect(pokemonStore.pokemon).toEqual({
      'used-pokemon': usedPokemon
    })
    expect(pokemonStore.domainVersion).toBe(DOMAIN_VERSION)
  })

  it('should keep pokemon used in multiple teams during cache invalidation', () => {
    const pokemonStore = usePokemonStore()
    const teamStore = useTeamStore()
    pokemonStore.domainVersion = -1 // outdated version

    const sharedPokemon = mocks.createMockPokemon({ externalId: 'shared-pokemon' })
    const unusedPokemon = mocks.createMockPokemon({ externalId: 'unused-pokemon' })

    pokemonStore.upsertLocalPokemon(sharedPokemon)
    pokemonStore.upsertLocalPokemon(unusedPokemon)

    teamStore.teams = [
      ...createMockTeams(1, { members: [sharedPokemon.externalId] }),
      ...createMockTeams(1, { members: [sharedPokemon.externalId] })
    ]

    pokemonStore.invalidateCache()

    expect(pokemonStore.pokemon).toEqual({
      'shared-pokemon': sharedPokemon
    })
  })

  it('should handle null team members during cache invalidation', () => {
    const pokemonStore = usePokemonStore()
    const teamStore = useTeamStore()
    pokemonStore.domainVersion = -1 // outdated version

    const usedPokemon = mocks.createMockPokemon({ externalId: 'used-pokemon' })
    const unusedPokemon = mocks.createMockPokemon({ externalId: 'unused-pokemon' })

    pokemonStore.upsertLocalPokemon(usedPokemon)
    pokemonStore.upsertLocalPokemon(unusedPokemon)

    teamStore.teams = createMockTeams(1, { members: [usedPokemon.externalId, undefined, undefined] })

    pokemonStore.invalidateCache()

    expect(pokemonStore.pokemon).toEqual({
      'used-pokemon': usedPokemon
    })
  })
})
