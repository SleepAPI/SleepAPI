import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useNotificationStore } from '@/stores/notification-store'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { clearCacheAndLogout, clearCacheKeepLogin, migrateStores } from '@/stores/store-service'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { createMockPokemon } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Store Service', () => {
  it('should clear cache and logout', () => {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const pokedexStore = usePokedexStore()
    const notificationStore = useNotificationStore()
    const comparisonStore = useComparisonStore()

    // Set some state to verify it gets reset
    userStore.avatar = 'some avatar'
    teamStore.teams = createMockTeams(2)
    pokemonStore.upsertLocalPokemon(createMockPokemon())
    pokedexStore.groupedPokedex = []
    notificationStore.showTeamNameNotification = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comparisonStore.members = [{ name: 'Charizard' }] as any

    clearCacheAndLogout()

    expect(userStore.avatar).toBeNull()
    expect(teamStore.teams).toHaveLength(1)
    expect(Object.keys(pokemonStore.pokemon)).toHaveLength(0)
    expect(pokedexStore.groupedPokedex).not.toEqual([])
    expect(notificationStore.showTeamNameNotification).toBe(true)
    expect(comparisonStore.members).toHaveLength(0)
  })

  it('should clear cache but keep user logged in', () => {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const pokedexStore = usePokedexStore()
    const notificationStore = useNotificationStore()
    const comparisonStore = useComparisonStore()

    // Set some state to verify it gets reset
    userStore.avatar = 'some avatar'
    teamStore.teams = createMockTeams(2)
    pokemonStore.upsertLocalPokemon(createMockPokemon())
    pokedexStore.groupedPokedex = []
    notificationStore.showTeamNameNotification = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comparisonStore.members = [{ name: 'Charizard' }] as any

    clearCacheKeepLogin()

    expect(userStore.avatar).toEqual('some avatar')
    expect(teamStore.teams).toHaveLength(1)
    expect(Object.keys(pokemonStore.pokemon)).toHaveLength(0)
    expect(pokedexStore.groupedPokedex).not.toEqual([])
    expect(notificationStore.showTeamNameNotification).toBe(true)
    expect(comparisonStore.members).toHaveLength(0)
  })

  it('should migrate stores', () => {
    const teamStore = useTeamStore()
    const comparisonStore = useComparisonStore()

    teamStore.migrate = vi.fn()
    comparisonStore.migrate = vi.fn()

    migrateStores()

    expect(teamStore.migrate).toHaveBeenCalled()
    expect(comparisonStore.migrate).toHaveBeenCalled()
  })
})
