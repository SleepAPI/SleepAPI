<template>
  <v-card class="py-3">
    <!-- Title, search and close button -->
    <v-row no-gutters class="flex-nowrap align-center">
      <v-col class="flex-grow-1 flex-shrink-1 min-width-0">
        <v-card-title class="px-2 text-truncate">Select a Pokémon</v-card-title>
      </v-col>
      <v-col class="flex-grow-0 flex-shrink-0">
        <CustomSearchBar
          v-model="searchQuery"
          @enter="selectFirstOption"
          label="Search Pokémon, ingredient or berry"
          :start-minimized="isMobile"
          :autofocus="!isMobile"
          density="compact"
          :min-width="100"
          :max-width="200"
        />
      </v-col>
      <v-col cols="auto" class="flex-shrink-0">
        <v-btn icon="mdi-close" @click="closePokemonSearch" elevation="0" />
      </v-col>
    </v-row>

    <v-row dense class="flex-left px-3 mt-0 mb-1 justify-space-between">
      <v-chip-group v-model="selectedSpecialties" multiple>
        <CustomChip
          v-for="specialty in specialties"
          :key="specialty"
          :value="specialty"
          :color="specialty"
          :is-selected="selectedSpecialties.includes(specialty)"
          :text="capitalize(specialty)"
          size="x-small"
        />
      </v-chip-group>
      <v-badge v-model="pokemonSearchStore.showPokeboxBadge" dot location="top right" color="primary">
        <v-btn
          @click="handlePokeboxClick"
          :title="pokemonSearchStore.showPokebox ? 'Showing Pokebox' : 'Showing All Pokemon'"
          size="small"
          elevation="0"
          icon
        >
          <v-img
            src="/images/misc/pokebox.png"
            width="36"
            height="36"
            :class="pokemonSearchStore.showPokebox ? '' : 'grayscale'"
          />
        </v-btn>
      </v-badge>
    </v-row>

    <v-row dense class="flex-center px-3 mt-0 flex-nowrap">
      <v-checkbox
        v-if="!pokemonSearchStore.showPokebox"
        v-model="finalStageOnly"
        label="Final Stage Only"
        density="compact"
        hide-details
      />
      <v-spacer />
      <DropdownSort
        v-model="selectedSort"
        v-model:sort-ascending="sortAscending"
        :sort-options="sortOptions"
        color="secondary"
      />
    </v-row>

    <v-divider class="my-2" />

    <!-- Pokemon list -->
    <div ref="pokemonListContainer" :style="containerStyle">
      <div v-if="loading" class="d-flex justify-center align-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
      </div>
      <div
        v-else-if="pokemonSearchStore.showPokebox && savedPokemon.length === 0"
        class="d-flex justify-center align-center pa-6"
      >
        <div class="text-center">
          <v-icon icon="mdi-pokeball" size="48" color="grey-lighten-1" class="mb-3"></v-icon>
          <div class="text-h6 mb-2">Your Pokebox is empty</div>
          <div>
            <span v-if="!userStore.loggedIn"> Please log in to save Pokémon to your Pokebox </span>
            <span v-else> Add Pokémon from your teams to start building your personal collection </span>
          </div>
        </div>
      </div>
      <v-row v-else dense class="d-flex justify-space-around mx-1">
        <v-col v-for="{ path, pokemon, instance } in filteredPokemon" :key="instance.externalId" class="flex-center">
          <div class="flex-column align-center">
            <div v-if="pokemonSearchStore.showPokebox && instance" class="text-center text-caption mb-1">
              <div>Level {{ instance.level }}</div>
            </div>
            <v-avatar
              color="secondary"
              class="cursor-pointer"
              @click="selectPokemon(instance)"
              :size="isMobile ? 60 : 100"
              rounded="lg"
            >
              <v-img :src="path"></v-img>
            </v-avatar>
            <div
              v-if="pokemonSearchStore.showPokebox"
              class="text-center text-caption mt-1 text-truncate pokemon-name"
              :class="{ 'pokemon-name--mobile': isMobile }"
            >
              {{ instance ? instance.name : pokemon.displayName }}
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-card>

  <!-- Pokebox info dialog -->
  <v-dialog v-model="showPokeboxInfoDialog" max-width="400px">
    <v-card class="pa-4">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon icon="mdi-pokeball" color="primary" class="mr-2"></v-icon>
        What is the Pokébox?
      </v-card-title>
      <v-card-text class="text-body-2">
        <div class="flex-center mb-3">
          <v-img src="/images/misc/pokebox.png" width="32" height="32" class="grayscale mr-2" />
          <span class="mr-2">→</span>
          <v-img src="/images/misc/pokebox.png" width="32" height="32" class="mr-2" />
          <span class="text-body-2">Click to toggle between all Pokémon and your saved collection</span>
        </div>
        <p class="mb-0">Save any Pokémon from your teams to your Pokébox to quickly reuse them later.</p>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="closePokeboxInfo">Got it!</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import CustomChip from '@/components/custom-components/custom-chip/CustomChip.vue'
import DropdownSort from '@/components/custom-components/dropdown-sort/DropdownSort.vue'
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { UserService } from '@/services/user/user-service'
import { avatarImage } from '@/services/utils/image-utils'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonSearchStore } from '@/stores/pokemon-search-store'
import { useUserStore } from '@/stores/user-store'
import {
  capitalize,
  COMPLETE_POKEDEX,
  hasSpecialty,
  type Pokemon,
  type PokemonInstance,
  type PokemonSpecialty
} from 'sleepapi-common'
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

const emit = defineEmits<{
  cancel: []
  save: [pokemon: PokemonInstance]
}>()

export interface PokemonWithPath {
  path: string
  pokemon: Pokemon
  instance: PokemonInstance
}

const pokemonSearchStore = usePokemonSearchStore()
const userStore = useUserStore()
const dialogStore = useDialogStore()

const searchQuery = ref('')
const selectedSpecialties = ref<PokemonSpecialty[]>([])
const specialties: PokemonSpecialty[] = ['berry', 'ingredient', 'skill']
const finalStageOnly = computed({
  get: () => pokemonSearchStore.finalStageOnly,
  set: (value: boolean) => {
    // When user manually toggles, update the persistent preference
    pokemonSearchStore.setUserFinalStageOnly(value)
  }
})
const selectedSort = computed({
  get: () => (pokemonSearchStore.showPokebox ? pokemonSearchStore.pokeboxSort : pokemonSearchStore.pokedexSort),
  set: (value: string) => {
    if (pokemonSearchStore.showPokebox) {
      pokemonSearchStore.setPokeboxSort(value, sortAscending.value)
    } else {
      pokemonSearchStore.setPokedexSort(value, sortAscending.value)
    }
  }
})

const sortAscending = computed({
  get: () =>
    pokemonSearchStore.showPokebox ? pokemonSearchStore.pokeboxSortAscending : pokemonSearchStore.pokedexSortAscending,
  set: (value: boolean) => {
    if (pokemonSearchStore.showPokebox) {
      pokemonSearchStore.setPokeboxSort(selectedSort.value, value)
    } else {
      pokemonSearchStore.setPokedexSort(selectedSort.value, value)
    }
  }
})
const showPokeboxInfoDialog = ref(false)

const sortOptions = computed(() => {
  const baseSortOptions = [
    { title: '#', value: 'pokedex', description: 'Sort by Pokédex number' },
    { title: 'A-Z', value: 'name', description: 'Sort alphabetically by name' }
  ]

  if (pokemonSearchStore.showPokebox) {
    return [
      ...baseSortOptions,
      { title: 'Level', value: 'level', description: 'Sort by Pokémon level' },
      { title: 'RP', value: 'rp', description: 'Sort by research power (RP)' }
    ]
  }

  return baseSortOptions
})

const { isMobile } = useBreakpoint()
const pokemonListContainer = ref<HTMLElement | null>(null)
const loading = ref(false)

// Computed style for consistent container height
// This is a pretty hacky solution, but I can't figure out a good way to not have the UI jump around
const containerStyle = computed(() => {
  const dialogMargins = 48 // Vuetify dialog margins (24px top + 24px bottom)
  const cardPadding = 24 // py-3 = 12px top + 12px bottom
  const titleRow = 40 // Title row height
  const filtersRow = 40 // Specialty chips and pokebox button row
  const checkboxRow = 48 // Final stage only and sort controls
  const divider = 12 // v-divider my-2
  const spacing = 5

  const totalFixedHeight = dialogMargins + cardPadding + titleRow + filtersRow + checkboxRow + spacing + divider

  return {
    minHeight: `calc(100vh - ${totalFixedHeight}px)`,
    transition: 'min-height 0.3s ease'
  }
})

const savedPokemon: Ref<PokemonWithPath[]> = ref([])
const completePokedex: Ref<PokemonWithPath[]> = ref(
  COMPLETE_POKEDEX.map((p) => ({
    pokemon: p,
    instance: PokemonInstanceUtils.createDefaultPokemonInstance(p),
    path: avatarImage({ pokemonName: p.name, shiny: false, happy: false })
  })).sort((a, b) => a.pokemon.pokedexNumber - b.pokemon.pokedexNumber)
)

const pokemonCollection: ComputedRef<PokemonWithPath[]> = computed(() => {
  return pokemonSearchStore.showPokebox ? savedPokemon.value : completePokedex.value
})

const hasExactIngredientMatch = (pokemon: Pokemon, query: string): boolean => {
  const allIngredients = [...pokemon.ingredient0, ...pokemon.ingredient30, ...pokemon.ingredient60]
  return allIngredients.some(
    (ingredientSet) =>
      ingredientSet.ingredient.name.toLowerCase() === query || ingredientSet.ingredient.longName.toLowerCase() === query
  )
}

const filteredPokemon: ComputedRef<PokemonWithPath[]> = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim()

  const nameFilter = (p: PokemonWithPath) => {
    if (!query) return true

    const pokemonNameMatches = p.pokemon.displayName.toLowerCase().includes(query)

    const instanceNameMatches = pokemonSearchStore.showPokebox && p.instance.name.toLowerCase().includes(query)

    const ingredientMatches = hasExactIngredientMatch(p.pokemon, query)

    return pokemonNameMatches || instanceNameMatches || ingredientMatches
  }

  const specialtyFilter = (p: PokemonWithPath) =>
    selectedSpecialties.value.length === 0 || selectedSpecialties.value.some((s) => hasSpecialty(p.pokemon, s))
  const finalStageFilter = (p: PokemonWithPath) =>
    !finalStageOnly.value || pokemonSearchStore.showPokebox || p.pokemon.remainingEvolutions === 0

  const filtered = pokemonCollection.value.filter(nameFilter).filter(specialtyFilter).filter(finalStageFilter)

  const sorted = filtered.sort((a, b) => {
    let compareValue = 0

    switch (selectedSort.value) {
      case 'pokedex':
        compareValue = a.pokemon.pokedexNumber - b.pokemon.pokedexNumber
        break
      case 'name':
        compareValue = a.pokemon.displayName.localeCompare(b.pokemon.displayName)
        break
      case 'specialty':
        compareValue = a.pokemon.specialty.localeCompare(b.pokemon.specialty)
        break
      case 'evolution':
        compareValue = a.pokemon.remainingEvolutions - b.pokemon.remainingEvolutions
        break
      case 'level':
        compareValue = (a.instance?.level ?? 0) - (b.instance?.level ?? 0)
        break
      case 'rp':
        compareValue = (a.instance?.rp ?? 0) - (b.instance?.rp ?? 0)
        break
      default:
        compareValue = a.pokemon.pokedexNumber - b.pokemon.pokedexNumber
    }

    return sortAscending.value ? compareValue : -compareValue
  })

  return sorted
})

const selectFirstOption = () => {
  const firstOption = filteredPokemon.value[0]
  if (firstOption) {
    selectPokemon(firstOption.instance)
  }
}

const selectPokemon = (instance: PokemonInstance) => {
  if (dialogStore.pokemonSearchCallback) {
    // If selecting from Pokebox, use the instance directly
    if (pokemonSearchStore.showPokebox) {
      dialogStore.handlePokemonSelected(instance)
      emit('save', instance)
    } else {
      // Selecting from Pokedex with callback
      // If we have a current instance (pokemon-button scenario), preserve attributes and use directly
      if (dialogStore.pokemonSearchCurrentInstance) {
        const finalInstance = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(
          instance.pokemon,
          dialogStore.pokemonSearchCurrentInstance
        )
        dialogStore.handlePokemonSelected(finalInstance)
        emit('save', finalInstance)
      } else {
        // No current instance (new pokemon scenario) - open pokemon input for customization
        dialogStore.openPokemonInput((updatedInstance: PokemonInstance) => {
          dialogStore.handlePokemonSelected(updatedInstance)
          emit('save', updatedInstance)
        }, instance)
      }
    }
  } else {
    // No callback - open pokemon input dialog for standalone usage
    dialogStore.openPokemonInput((updatedInstance: PokemonInstance) => {
      emit('save', updatedInstance)
    }, instance)
  }
}

const closePokemonSearch = () => {
  emit('cancel')
}

const loadPokebox = async () => {
  if (loading.value) {
    logger.debug('Already loading, skipping concurrent call')
    return
  }

  loading.value = true

  savedPokemon.value = await UserService.getUserPokemon().then((instances) =>
    instances.map((instance) => ({
      pokemon: instance.pokemon,
      instance,
      path: avatarImage({ pokemonName: instance.pokemon.name, shiny: instance.shiny, happy: false })
    }))
  )
  loading.value = false
}

const showPokeboxInfo = () => {
  showPokeboxInfoDialog.value = true
}

const closePokeboxInfo = () => {
  showPokeboxInfoDialog.value = false
  pokemonSearchStore.hidePokeboxBadge()
}

const handlePokeboxClick = () => {
  pokemonSearchStore.togglePokebox()
}

// Initialize temporary state from persistent state
pokemonSearchStore.restoreFinalStageOnly()

if (userStore.loggedIn) {
  loadPokebox()
}

// Show pokebox info dialog automatically on first component open
if (pokemonSearchStore.showPokeboxBadge) {
  showPokeboxInfo()
}

// Also watch for pokebox toggle and load data if needed
watch(
  () => [pokemonSearchStore.showPokebox, userStore.loggedIn],
  async ([showPokebox, loggedIn]) => {
    if (showPokebox && loggedIn && savedPokemon.value.length === 0) {
      await loadPokebox()
    }
  },
  { immediate: true }
)

// Uncheck finalStageOnly when user starts typing in search, restore when cleared
watch(
  () => searchQuery.value,
  (newQuery) => {
    if (newQuery && newQuery.trim() !== '') {
      // User is typing - temporarily disable final stage only
      if (finalStageOnly.value) {
        pokemonSearchStore.setFinalStageOnly(false)
      }
    } else {
      // Search cleared - restore from user preference
      pokemonSearchStore.restoreFinalStageOnly()
    }
  }
)
</script>

<style scoped lang="scss">
.pokemon-name {
  max-width: 100px;

  &--mobile {
    max-width: 60px;
  }
}

.min-width-0 {
  min-width: 0;
}
</style>
