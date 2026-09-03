<template>
  <!-- class is used to query select for the download share image -->
  <v-container class="tier-list-container">
    <BubbleBackground class="rounded-lg">
      <!-- Header title-->
      <div class="sleep-header-content">
        <div class="flex-center flex-wrap">
          <h1 class="text-h4 text-no-wrap mb-0">Cooking Tier List</h1>
        </div>
        <v-divider length="200px" class="mx-auto my-2" />
        <p class="text-subtitle-1">Neroli's Lab</p>
      </div>

      <!-- Header controls -->
      <div class="sleep-controls">
        <div class="d-flex align-start justify-space-between w-100">
          <div class="d-flex align-center flex-wrap">
            <CustomSearchBar
              v-model="searchQuery"
              density="compact"
              label="Search..."
              :autofocus="false"
              :start-minimized="true"
              :max-width="!isMobile ? 350 : undefined"
              class="ma-1"
            />

            <div class="d-flex align-center flex-nowrap ma-1 flex-shrink-0">
              <v-btn-toggle
                v-model="selectedLevel"
                mandatory
                base-color="surface"
                color="primary"
                density="comfortable"
              >
                <v-btn :value="30">Lv 30</v-btn>
                <v-btn :value="60">Lv 60</v-btn>
              </v-btn-toggle>
              <v-btn icon @click="toggleCamp" color="transparent" elevation="0" height="40" width="40" class="ml-2">
                <v-img
                  height="40"
                  width="40"
                  :src="camp ? '/images/misc/camp.png' : '/images/misc/camp-grayscale.png'"
                  :alt="camp ? 'Camp Mode On' : 'Camp Mode Off'"
                  eager
                />
              </v-btn>
            </div>
          </div>

          <!-- Share Button -->
          <v-btn
            icon="mdi-share-variant"
            class="rounded ma-1 flex-shrink-0"
            height="40"
            width="40"
            base-color="rgba(255, 255, 255, 0.15)"
            @click="openShareDialog"
            elevation="0"
          >
          </v-btn>
        </div>
      </div>
    </BubbleBackground>

    <!-- Trending Pokémon Ticker -->
    <TrendingTicker :items="scrollingTrendingItems" class="my-2">
      <template v-slot:default="{ item }">
        <v-chip
          :key="item.uniqueKey"
          :color="item.type === 'riser' ? getDiffDisplayInfo(item.diff).color : getDiffDisplayInfo(item.diff).color"
          class="ma-1 flex-shrink-0"
          label
        >
          <v-icon start size="small">
            {{ item.type === 'riser' ? 'mdi-trending-up' : 'mdi-trending-down' }}
          </v-icon>
          {{ item.name }} ({{ item.type === 'riser' ? '+' : '' }}{{ item.diff }})
        </v-chip>
      </template>
    </TrendingTicker>

    <!-- Loading/Error State -->
    <v-row v-if="isLoading" justify="center" class="my-10">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-3 text-h6">Loading Data...</p>
      </v-col>
    </v-row>
    <v-row v-else-if="error" justify="center" class="my-6">
      <v-col md="6" sm="8" cols="12">
        <v-alert type="error" prominent border="start" variant="tonal" class="frosted-glass-error">
          <template v-slot:title><span class="font-weight-bold">Data Lookup Failed</span></template>
          Could not retrieve tier list data. The server may be temporarily offline, please contact the developers.
          <div class="text-small mt-2">Error: {{ error }}</div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Tier List Display Area -->
    <div v-else-if="filteredTierList.length > 0">
      <TierRow
        v-for="tierKey in displayedTiers"
        :key="tierKey"
        :tier="tierKey"
        :pokemonsInTier="groupedPokemonByTier[tierKey] || []"
        @click:pokemon="handlePokemonClick"
      />
    </div>
    <v-row v-else class="my-10">
      <v-col cols="12" class="text-center text-disabled">
        <v-icon size="x-large">{{ searchQuery ? 'mdi-feature-search-outline' : 'mdi-magnify-scan' }}</v-icon>
        <p class="mt-2 text-h6">
          {{ searchQuery ? 'No Pokémon match your search.' : 'No Pokémon data found for the selected criteria.' }}
        </p>
      </v-col>
    </v-row>

    <!-- Pokemon Detail Modal -->
    <v-dialog v-model="showDetailModal" max-width="750px" scrollable>
      <PokemonDetailModal
        v-if="selectedPokemonForDetail"
        :pokemon="selectedPokemonForDetail"
        :allPokemonVariantsData="selectedPokemonAllVariants"
        :camp="camp"
        :level="selectedLevel"
        @close="showDetailModal = false"
      />
    </v-dialog>

    <!-- Share Dialog -->
    <v-dialog v-model="showShareDialog" max-width="500px">
      <v-card class="">
        <v-card-title class="d-flex align-center">
          <v-icon start color="accent">mdi-share-variant</v-icon>
          Share Tier List
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="shareableLink"
            label="Shareable Link"
            readonly
            variant="outlined"
            density="compact"
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyShareLink"
            class="mb-4"
            hide-details
          ></v-text-field>

          <v-btn block color="primary" @click="downloadTierListImage" class="mt-2 mb-2" :loading="isDownloadingImage">
            <v-icon start>mdi-download</v-icon>
            Download as Image
          </v-btn>

          <v-btn block variant="tonal" @click="copyTierListImage" class="mt-2" :loading="isCopyingImage">
            <v-icon start>mdi-content-copy</v-icon>
            Copy Image to Clipboard
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showShareDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.color === 'info' ? 10000 : 3000"
      location="top right"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import BubbleBackground from '@/components/custom-components/backgrounds/BubbleBackground.vue'
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import TrendingTicker from '@/components/custom-components/TrendingTicker.vue'
import PokemonDetailModal from '@/components/tierlist/PokemonDetailModal.vue'
import TierRow from '@/components/tierlist/TierRow.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { tierlistService } from '@/services/tierlist-service'
import { getDiffDisplayInfo } from '@/services/utils/ui-utils'
import { getPokemon, type PokemonWithTiering, type Tier, type TierlistSettings } from 'sleepapi-common'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { isMobile } = useBreakpoint()

const route = useRoute()
const router = useRouter()

const camp = ref(false)
const selectedLevel = ref<30 | 60>(60)
const tierList = ref<PokemonWithTiering[]>([])
const searchQuery = ref('')

const isLoading = ref(false)
const error = ref<string | null>(null)

const showDetailModal = ref(false)
const selectedPokemonForDetail = ref<PokemonWithTiering | null>(null)
const selectedPokemonAllVariants = ref<PokemonWithTiering[]>([])

const showShareDialog = ref(false)
const shareableLink = ref('')
const isDownloadingImage = ref(false)
const isCopyingImage = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const displayedTiersOrder: Tier[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']

const currentSettings = computed(
  (): TierlistSettings => ({
    level: selectedLevel.value,
    camp: camp.value
  })
)

const filteredTierList = computed(() => {
  if (!searchQuery.value) {
    return tierList.value
  }
  const searchLower = searchQuery.value.toLowerCase()
  return tierList.value.filter((pokemon) => {
    const nameMatch = pokemon.pokemonWithSettings.pokemon.toLowerCase().includes(searchLower)
    const ingredientMatch = pokemon.pokemonWithSettings.ingredientList.some((ing) =>
      ing.name.toLowerCase().includes(searchLower)
    )
    const recipeMatch = pokemon.contributions?.some((contrib) => contrib.recipe.toLowerCase().includes(searchLower))
    return nameMatch || ingredientMatch || recipeMatch
  })
})

const groupedPokemonByTier = computed<Record<Tier, PokemonWithTiering[]>>(() => {
  const groups: Record<Tier, PokemonWithTiering[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: []
  }
  filteredTierList.value.forEach((pokemon) => {
    groups[pokemon.tier].push(pokemon)
  })
  return groups
})

// just a safety check to ensure we don't display tiers that don't have any Pokemon
const displayedTiers = computed(() => {
  return displayedTiersOrder.filter((tier) => groupedPokemonByTier.value[tier]?.length > 0)
})

const sortedTrendingItems = computed(() => {
  if (!tierList.value || tierList.value.length === 0) return []

  const items = tierList.value
    .filter((p) => p.diff !== undefined && p.diff !== 0)
    .map((p) => {
      const name = getPokemon(p.pokemonWithSettings.pokemon).displayName
      const diff = p.diff!
      return {
        name,
        diff,
        absDiff: Math.abs(diff),
        type: diff > 0 ? 'riser' : 'faller'
      }
    })

  return items.sort((a, b) => b.absDiff - a.absDiff).slice(0, 10)
})

const scrollingTrendingItems = computed(() => {
  if (!sortedTrendingItems.value || sortedTrendingItems.value.length === 0) {
    return []
  }
  const originalItems = sortedTrendingItems.value

  // Create a deep copy and add unique keys for original and duplicated items
  const itemsWithOriginalKeys = originalItems.map((item, index) => ({
    ...item,
    uniqueKey: `${item.name}-${item.type}-original-${index}`
  }))
  // We need at least two sets of items for continuous scroll, even if short.
  // If there are items, duplicate them to ensure the wrapper is wide enough for smooth looping.
  const itemsToScroll =
    originalItems.length > 0
      ? [
          ...itemsWithOriginalKeys,
          ...itemsWithOriginalKeys.map((item) => ({
            ...item,
            uniqueKey: item.uniqueKey.replace('-original-', '-duplicate-')
          }))
        ]
      : []

  return itemsToScroll
})

const loadTierlist = async (settings: TierlistSettings) => {
  isLoading.value = true
  error.value = null
  try {
    tierList.value = await tierlistService.fetchTierlist(settings)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An unknown error occurred'
    tierList.value = []
  } finally {
    isLoading.value = false
  }
}

const updateRoute = () => {
  router.push({
    name: route.name ?? undefined,
    query: {
      level: selectedLevel.value.toString(),
      camp: String(camp.value)
    }
  })
}

const toggleCamp = () => {
  camp.value = !camp.value
}

const handlePokemonClick = (pokemon: PokemonWithTiering) => {
  selectedPokemonForDetail.value = pokemon
  selectedPokemonAllVariants.value = tierlistService.getPokemonVariants(pokemon.pokemonWithSettings.pokemon)
  showDetailModal.value = true
}

const openShareDialog = () => {
  shareableLink.value = window.location.href
  showShareDialog.value = true
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareableLink.value)
    snackbar.value = { show: true, text: 'Link copied to clipboard!', color: 'success' }
  } catch (err) {
    console.error('Failed to copy link: ', err)
    snackbar.value = { show: true, text: 'Failed to copy link', color: 'error' }
  }
}

const captureTierList = async () => {
  const elementToCapture = document.querySelector('.tier-list-container') as HTMLElement | null

  if (!elementToCapture) {
    throw new Error('Tier list element not found')
  }

  // Disable animations during capture
  elementToCapture.classList.add('capturing-image')

  // Wait a frame to ensure the class is applied
  await new Promise((resolve) => requestAnimationFrame(resolve))

  const { default: html2canvas } = await import('html2canvas')

  try {
    const canvas = await html2canvas(elementToCapture, {
      backgroundColor: '#191224',
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      scale: 2, // Increase quality
      width: elementToCapture.scrollWidth,
      height: elementToCapture.scrollHeight,
      logging: false,
      // Optimize rendering
      allowTaint: true,
      foreignObjectRendering: false
    })

    return canvas
  } finally {
    // Re-enable animations after capture
    elementToCapture.classList.remove('capturing-image')
  }
}

const copyTierListImage = async () => {
  isCopyingImage.value = true
  try {
    snackbar.value = { show: true, text: 'Preparing images for capture...', color: 'info' }
    const canvas = await captureTierList()
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.8)
    })

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ])

    snackbar.value = { show: true, text: 'Image copied to clipboard!', color: 'success' }
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err)
    snackbar.value = { show: true, text: 'Failed to copy image. Check console.', color: 'error' }
  } finally {
    isCopyingImage.value = false
  }
}

const downloadTierListImage = async () => {
  isDownloadingImage.value = true
  try {
    snackbar.value = { show: true, text: 'Preparing images for capture...', color: 'info' }
    const canvas = await captureTierList()
    const image = canvas.toDataURL('image/png', 0.8)
    const link = document.createElement('a')
    link.download = `pokemon_tierlist_L${selectedLevel.value}_camp_${camp.value ? 'on' : 'off'}.png`
    link.href = image
    link.click()
    snackbar.value = { show: true, text: 'Image download started!', color: 'success' }
  } catch (err) {
    console.error('Failed to download image with html2canvas:', err)
    snackbar.value = { show: true, text: 'Failed to download image. Check console.', color: 'error' }
  } finally {
    isDownloadingImage.value = false
  }
}

onMounted(() => {
  const queryLevel = route.query.level ? parseInt(route.query.level as string) : undefined
  const queryCamp = route.query.camp ? route.query.camp === 'true' : undefined

  selectedLevel.value = queryLevel === 30 || queryLevel === 60 ? queryLevel : 60
  camp.value = queryCamp === undefined ? true : queryCamp

  loadTierlist(currentSettings.value)
})

watch(
  [camp, selectedLevel],
  (newValues, oldValues) => {
    // Only trigger on actual changes to camp or selectedLevel
    const newCamp = newValues[0]
    const newLvl = newValues[1]
    const oldCamp = oldValues[0]
    const oldLvl = oldValues[1]

    if (newCamp !== oldCamp || newLvl !== oldLvl) {
      loadTierlist(currentSettings.value)
      updateRoute()
    }
  },
  { deep: false }
)

watch(
  () => route.query,
  (newQuery, oldQuery) => {
    const queryLevel = newQuery.level ? parseInt(newQuery.level as string) : undefined
    const queryCamp = newQuery.camp ? newQuery.camp === 'true' : undefined

    let needsUpdate = false
    if ((queryLevel === 30 || queryLevel === 60) && selectedLevel.value !== queryLevel) {
      selectedLevel.value = queryLevel
      needsUpdate = true
    }
    if (queryCamp !== undefined && camp.value !== queryCamp) {
      camp.value = queryCamp
      needsUpdate = true
    }
    // Only load if there was a change triggered by the route that differs from current state
    // and to avoid double loading if the other watcher already triggered a load.
    if (needsUpdate && (oldQuery.level !== newQuery.level || oldQuery.camp !== newQuery.camp)) {
      loadTierlist(currentSettings.value)
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
// Header content
.sleep-header-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px 20px 10px 20px;

  h1 {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
    animation: fadeInUp 0.8s both;
  }

  p {
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    animation: fadeInUp 0.8s 0.2s both;
  }
}

.sleep-controls {
  padding: 15px 15px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Disable animations during image capture
.tier-list-container.capturing-image {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
