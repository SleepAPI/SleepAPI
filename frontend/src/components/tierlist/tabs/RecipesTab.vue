<template>
  <div v-if="pokemonVariants.length > 1" class="">
    <v-card variant="plain">
      <v-card-title>Variants</v-card-title>
      <v-chip-group v-model="selectedVariantIndex" mandatory :show-arrows="pokemonVariants.length > 6 || isMobile">
        <CustomChip
          v-for="(variant, index) in displayedVariantChips"
          :key="index"
          :value="index"
          :is-selected="selectedVariantIndex === index"
          :color="`tier-${variant.tier.toLowerCase()}`"
        >
          <div class="flex-center flex-wrap">
            <div class="flex-center">
              <v-avatar v-for="(ing, i) in variant.pokemonWithSettings.ingredientList" :key="i" size="25" tile>
                <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
              </v-avatar>
            </div>
            <span
              :class="[
                'ml-1',
                selectedVariantIndex !== index ? `text-tier-${variant.tier.toLowerCase()}` : '',
                'font-weight-bold'
              ]"
              >{{ variant.tier }}</span
            >
          </div>
        </CustomChip>
      </v-chip-group>
    </v-card>
  </div>

  <!-- Custom navigation outside chip group -->
  <div v-if="totalChunks > 1" class="d-flex justify-center align-center">
    <v-btn :disabled="!hasPrevChunk" icon="mdi-chevron-left" variant="text" size="small" @click="goToPrevChunk" />
    <span class="mx-2 text-small"
      >Showing {{ currentChunkIndex * chunkSize + 1 }}-{{
        Math.min((currentChunkIndex + 1) * chunkSize, pokemonVariants.length)
      }}
      of {{ pokemonVariants.length }} variants</span
    >
    <v-btn :disabled="!hasNextChunk" icon="mdi-chevron-right" variant="text" size="small" @click="goToNextChunk" />
  </div>

  <!-- Loading state -->
  <div v-if="isLoading" class="text-center py-8">
    <v-progress-circular indeterminate color="primary" size="64" />
    <div class="text-h6 mt-4">Loading recipe contributions...</div>
    <div class="text-small text-medium-emphasis">
      Processing {{ pokemonVariants.length }} variants may take a moment
    </div>
  </div>

  <!-- Error state -->
  <v-alert v-else-if="hasError" type="error" class="mb-4">
    <div class="text-subtitle-1">Unable to load recipe data</div>
    <div class="text-body-2">
      This Pokemon has too many variants to process efficiently. Try selecting a specific variant first.
    </div>
    <template #append>
      <v-btn variant="outlined" size="small" @click="retryLoading"> Retry </v-btn>
    </template>
  </v-alert>

  <!-- Recipe contributions -->
  <v-list v-else density="comfortable" bg-color="transparent">
    <v-list-item
      v-for="(contrib, index) in topContributions"
      :key="index"
      class="mb-2"
      :base-color="contrib.recipe.type"
      rounded="lg"
      :style="{ backgroundColor: `${withOpacity(contrib.recipe.type, 0.1)}` }"
    >
      <v-list-item-title class="font-weight-bold text-subtitle-1 flex-left flex-nowrap">
        <v-avatar rounded="lg" size="48" class="align-self-start">
          <v-img :src="recipeDisplayImageUrl(contrib.recipe.name)" :alt="contrib.recipe.name" eager></v-img>
        </v-avatar>
        <div class="flex-left flex-wrap text-truncate">
          <span class="mr-2 text-truncate">{{ contrib.recipe.displayName }}</span>
          <div class="flex-center ga-1">
            <div v-for="(ing, index) in contrib.recipe.ingredients" :key="index" class="flex-center flex-nowrap">
              <v-avatar size="20">
                <v-img :src="ingredientDisplayImageUrl(ing.ingredient.name)" :alt="ing.ingredient.name" eager></v-img>
              </v-avatar>
              <span>{{ ing.amount }}</span>
            </div>
          </div>
        </div>
      </v-list-item-title>
      <v-list-item-subtitle>
        <div class="flex-center justify-space-between">
          <div class="text-medium-emphasis flex-left flex-wrap ga-1">
            <span class="text-no-wrap">
              Contribution:
              <span class="font-weight-medium mr-2" :style="{ color: tierColorMapping.A }">{{
                localizeNumber(contrib.score)
              }}</span>
            </span>
            <span v-if="contrib.coverage !== undefined" class="text-no-wrap">
              Coverage: <span class="mr-2">{{ contrib.coverage.toFixed(1) }}%</span>
            </span>
            <span v-if="contrib.skillValue !== undefined && contrib.skillValue > 0" class="text-no-wrap">
              Support value: {{ localizeNumber(contrib.skillValue) }}
            </span>
          </div>

          <v-menu :max-width="500">
            <template #activator="{ props }">
              <v-btn
                v-if="isMobile"
                icon="mdi-play"
                size="x-small"
                color="primary"
                v-bind="props"
                class="ml-4 force-opacity"
              />
              <v-btn
                v-else
                size="small"
                color="primary"
                v-bind="props"
                append-icon="mdi-chevron-right"
                class="force-opacity"
              >
                Simulate
              </v-btn>
            </template>
            <v-card title="Simulate this recipe team" :loading="isSimulating">
              <v-card-text>
                <v-row dense>
                  <v-col cols="12">
                    <TeamSelect
                      v-model="teamIndex"
                      placeholder-text="Select team to replace"
                      card-title="Select team"
                      :show-full-details="true"
                      :show-island="false"
                      :show-delete-button="false"
                      :show-camp="true"
                      :show-sleep-score="true"
                      :show-members="true"
                      button-class="mb-2"
                      :max-team-size="MAX_TEAM_SIZE"
                    />
                  </v-col>

                  <v-col cols="12" class="mb-6">
                    <v-alert type="warning"> Note that this will replace the selected team. </v-alert>
                  </v-col>

                  <v-col cols="12" class="flex-right">
                    <v-btn
                      color="primary"
                      text="Simulate"
                      :disabled="teamIndex === undefined || isSimulating"
                      @click.stop="simulateRecipe(contrib)"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
      </v-list-item-subtitle>

      <div v-if="contrib.team && contrib.team.length > 0" class="d-flex flex-column flex-sm-row align-start mt-2">
        <span class="text-medium-emphasis text-no-wrap mr-1">Team: </span>
        <div class="d-flex flex-wrap ga-1">
          <CustomChip
            v-for="(member, tIndex) in contrib.team"
            :key="tIndex"
            size="small"
            :interactive="true"
            :show-menu="true"
            :color="isCurrentVariantTeamMember(member) ? 'primary' : ''"
            :variant="isCurrentVariantTeamMember(member) ? 'elevated' : 'outlined'"
            :prepend-avatar="pokemonDisplayImageUrlByName(member.pokemon)"
          >
            <v-avatar
              v-for="(ing, index) in member.ingredientList"
              :key="index"
              size="20"
              :title="`${ing.amount} ${ing.name}`"
            >
              <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
            </v-avatar>

            <template #append>
              <v-icon class="ml-2" icon="mdi-information" size="small" />
            </template>

            <template #menu-title>
              <div class="flex-center ga-1">
                <div
                  v-for="(prod, ingIndex) in getDisplayProductionSummary(member)"
                  :key="ingIndex"
                  class="flex-center"
                >
                  <v-img
                    height="28"
                    width="28"
                    :src="ingredientDisplayImageUrl(prod.name)"
                    :alt="prod.isMagnet ? 'All other ingredients' : prod.name"
                    eager
                  ></v-img>
                  <span class="mr-1">{{ prod.amount.toFixed(1) }}</span>
                </div>
              </div>
            </template>

            <template #menu-content>
              <v-divider />
              <v-card-text class="d-flex flex-column ga-1">
                <div class="d-flex flex-column ga-1">
                  <span>Nature: {{ member.nature }} </span>
                  <span>Subskills: {{ member.subskills.map((s) => getSubskill(s).shortName).join(', ') }} </span>
                </div>
              </v-card-text>
            </template>
          </CustomChip>
        </div>
      </div>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import CustomChip from '@/components/custom-components/custom-chip/CustomChip.vue'
import TeamSelect from '@/components/custom-components/team-select/TeamSelect.vue'
import { error } from '@/components/snackbar/snackbar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { withOpacity } from '@/services/utils/color-utils'
import {
  avatarImage as getPokemonDisplayImageUrlUtil,
  recipeImage as getRecipeImageUrlUtil
} from '@/services/utils/image-utils'
import { getIngredientImageUrl, processIngredientsForDisplay } from '@/services/utils/ingredient-display-utils'
import { randomName } from '@/services/utils/name-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamData } from '@/types/team/team-data'
import {
  CarrySizeUtils,
  DEFAULT_ISLAND,
  flatToIngredientSet,
  getIngredient,
  getNature,
  getPokemon,
  getRandomGender,
  getRecipe,
  getSubskill,
  ingredient,
  localizeNumber,
  MAX_RIBBON_LEVEL,
  MAX_TEAM_SIZE,
  uuid,
  type PokemonInstance,
  type PokemonWithTiering,
  type RecipeContribution,
  type TeamMemberProduction,
  type Tier
} from 'sleepapi-common'
import { computed, nextTick, ref, watch, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
  selectedVariantIndex?: number
  camp: boolean
  level: number
}>()

const { isMobile } = useBreakpoint()
const router = useRouter()

const selectedVariantIndex = ref(0)
const isLoading = ref(false)
const hasError = ref(false)
const isSimulating = ref(false)
const chunkSize = 10
const currentChunkIndex = ref(0)
const teamIndex = ref<number | undefined>(undefined)
const teamStore = useTeamStore()

// Sync with prop when it changes and calculate correct chunk
watch(
  () => props.selectedVariantIndex,
  (newIndex) => {
    if (newIndex !== undefined) {
      // Calculate which chunk contains this variant
      const targetChunk = Math.floor(newIndex / chunkSize)
      currentChunkIndex.value = targetChunk

      // Set the relative index within the current chunk
      selectedVariantIndex.value = newIndex % chunkSize
    }
  },
  { immediate: true }
)

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)

const pokemonVariants = computed(() => {
  return props.allPokemonVariantsData
    .filter((p) => p.pokemonWithSettings.pokemon === pokemonName.value)
    .sort((a, b) => b.score - a.score)
})

const displayedVariantChips = computed(() => {
  const startIndex = currentChunkIndex.value * chunkSize
  const endIndex = startIndex + chunkSize
  return pokemonVariants.value.slice(startIndex, endIndex)
})

const totalChunks = computed(() => Math.ceil(pokemonVariants.value.length / chunkSize))
const hasNextChunk = computed(() => currentChunkIndex.value < totalChunks.value - 1)
const hasPrevChunk = computed(() => currentChunkIndex.value > 0)

const goToNextChunk = () => {
  if (hasNextChunk.value) {
    currentChunkIndex.value++
    selectedVariantIndex.value = 0 // Reset to first item in new chunk
  }
}

const goToPrevChunk = () => {
  if (hasPrevChunk.value) {
    currentChunkIndex.value--
    selectedVariantIndex.value = 0 // Reset to first item in new chunk
  }
}

const selectedVariant = computed(() => {
  const actualIndex = currentChunkIndex.value * chunkSize + selectedVariantIndex.value
  return pokemonVariants.value[actualIndex] || props.pokemon
})

const topContributions: ComputedRef<RecipeContribution[]> = computed(() => {
  if (isLoading.value || hasError.value) {
    return []
  }

  try {
    return (
      selectedVariant.value.contributions?.map((c) => ({
        ...c,
        recipe: getRecipe(c.recipe)
      })) || []
    )
  } catch (error) {
    console.error('Error processing contributions:', error)
    hasError.value = true
    return []
  }
})

// Watch for variant changes and handle loading
watch(
  [selectedVariant, pokemonVariants],
  async ([newVariant, newVariants]) => {
    // Reset states first
    hasError.value = false

    if (newVariants.length > 100) {
      isLoading.value = true

      try {
        // Simulate processing time for large datasets
        await nextTick()

        // Check if the variant has contributions
        if (!newVariant.contributions || newVariant.contributions.length === 0) {
          hasError.value = true
        }

        // Add artificial delay for very large datasets to prevent UI freezing
        if (newVariants.length > 500) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        isLoading.value = false
      } catch (error) {
        console.error('Error loading variant data:', error)
        hasError.value = true
        isLoading.value = false
      }
    } else {
      // For smaller datasets, ensure loading is false
      isLoading.value = false

      // Still check if the variant has contributions
      if (!newVariant.contributions || newVariant.contributions.length === 0) {
        hasError.value = true
      }
    }
  },
  { immediate: true }
)

const retryLoading = () => {
  hasError.value = false
  isLoading.value = true

  // Force re-computation
  nextTick(() => {
    isLoading.value = false
  })
}

const recipeDisplayImageUrl = (name: string) => {
  return getRecipeImageUrlUtil(name)
}

const ingredientDisplayImageUrl = (name: string) => {
  return getIngredientImageUrl(name)
}

const pokemonDisplayImageUrlByName = (name: string) => {
  return getPokemonDisplayImageUrlUtil({ pokemonName: name, shiny: false, happy: false })
}

const isCurrentVariantTeamMember = (member: any) => {
  return (
    member.pokemon === selectedVariant.value.pokemonWithSettings.pokemon &&
    JSON.stringify(member.ingredientList) === JSON.stringify(selectedVariant.value.pokemonWithSettings.ingredientList)
  )
}

const tierColorMapping: Record<Tier, string> = {
  S: 'var(--v-theme-primary)',
  A: 'var(--v-theme-strength)',
  B: 'var(--v-theme-pretty-purple, #9771e0)',
  C: 'var(--v-theme-secondary)',
  D: 'var(--v-theme-secondary-dark)',
  E: 'var(--v-theme-surface-variant, #5b577c)',
  F: 'var(--v-theme-surface, #403d58)'
}

const getDisplayProductionSummary = (member: TeamMemberProduction) => {
  const flatIngredients = new Float32Array(Object.values(member.totalProduction))
  const ingredients = flatToIngredientSet(flatIngredients)
  return processIngredientsForDisplay(ingredients)
}

const simulateRecipe = async (contribution: RecipeContribution) => {
  const index = teamIndex.value
  if (index === undefined) {
    error('Team index is required')
    return
  }

  isSimulating.value = true

  try {
    const teamData: TeamData = {
      index,
      memberIndex: 0,
      name: 'Simulated Team',
      version: 0,
      memberIvs: {},
      production: undefined,
      island: DEFAULT_ISLAND,
      wakeup: '06:00',
      bedtime: '21:30',
      stockpiledIngredients: [],
      stockpiledBerries: [],
      recipeType: contribution.recipe.type,
      camp: props.camp,
      members: contribution.team.map((member) => {
        const pokemon = getPokemon(member.pokemon)
        return {
          carrySize: CarrySizeUtils.baseCarrySize(pokemon),
          pokemon,
          level: props.level,
          ribbon: MAX_RIBBON_LEVEL,
          ingredients: (() => {
            // Map the ingredients we have
            const mappedIngredients = member.ingredientList.map(({ name, amount }, index) => ({
              level: index * 30, // 0, 30, 60
              amount,
              ingredient: getIngredient(name)
            }))

            // Fill with A ingredient until we have 3
            while (mappedIngredients.length < 3) {
              // Add placeholder ingredient for missing slots
              mappedIngredients.push({
                level: mappedIngredients.length * 30,
                amount: pokemon.ingredient0.at(0)?.amount ?? 0,
                ingredient: pokemon.ingredient0.at(0)?.ingredient ?? ingredient.LOCKED_INGREDIENT
              })
            }

            return mappedIngredients
          })(),
          nature: getNature(member.nature),
          subskills: member.subskills.map((subskill, index) => ({
            level: index === 0 ? 10 : index * 25, // 10, 25, 50
            subskill: getSubskill(subskill)
          })),
          skillLevel: pokemon.skill.maxLevel,
          rp: 0,
          shiny: false,
          gender: getRandomGender(pokemon),
          version: 0,
          saved: false,
          externalId: uuid.v4(),
          name: randomName(pokemon, 12, getRandomGender(pokemon))
        } as PokemonInstance
      })
    }

    await teamStore.setCurrentTeam(teamData)

    router.push({
      name: 'Calculator'
    })
  } finally {
    isSimulating.value = false
  }
}
</script>

<style scoped lang="scss">
.v-list-item-subtitle {
  opacity: 1 !important;
}

.v-list-item-subtitle .text-medium-emphasis {
  opacity: 0.6;
}
</style>
