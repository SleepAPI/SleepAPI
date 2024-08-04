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

  userStore.$reset()
  teamStore.$reset()
  pokemonStore.$reset()
  pokedexStore.$reset()
  notificationStore.$reset()
}

export function clearCacheKeepLogin() {
  const teamStore = useTeamStore()
  const pokemonStore = usePokemonStore()
  const pokedexStore = usePokedexStore()
  const notificationStore = useNotificationStore()

  teamStore.$reset()
  pokemonStore.$reset()
  pokedexStore.$reset()
  notificationStore.$reset()
}
