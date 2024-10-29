import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useNotificationStore } from '@/stores/notification-store'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'

export function clearCacheAndLogout() {
  localStorage.clear()

  const userStore = useUserStore()
  const teamStore = useTeamStore()
  const pokemonStore = usePokemonStore()
  const pokedexStore = usePokedexStore()
  const notificationStore = useNotificationStore()
  const comparisonStore = useComparisonStore()

  userStore.$reset()
  teamStore.$reset()
  pokemonStore.$reset()
  pokedexStore.$reset()
  notificationStore.$reset()
  comparisonStore.$reset()
}

export function clearCacheKeepLogin() {
  const teamStore = useTeamStore()
  const pokemonStore = usePokemonStore()
  const pokedexStore = usePokedexStore()
  const notificationStore = useNotificationStore()
  const comparisonStore = useComparisonStore()

  teamStore.$reset()
  pokemonStore.$reset()
  pokedexStore.$reset()
  notificationStore.$reset()
  comparisonStore.$reset()
}

export function migrateStores() {
  const teamStore = useTeamStore()
  const comparisonStore = useComparisonStore()
  teamStore.migrate()
  comparisonStore.migrate()
}
