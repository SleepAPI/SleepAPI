<template>
  <v-row class="flex-center px-2">
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Island Impact </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>

  <v-row class="flex-left px-2 flex-nowrap" dense>
    <v-col cols="auto" class="flex-center">
      <v-img :src="berryImage(memberBerry)" alt="" height="40" width="40" />
    </v-col>
    <v-col class="flex-column status-col">
      <span class="text-berry text-no-wrap">{{ statusLabel }}</span>
      <div class="effect-list">
        <div v-for="effect in effects" :key="effect.text" class="flex-left">
          <v-icon v-if="effect.icon" size="28">{{ effect.icon }}</v-icon>
          <v-img v-else :src="effect.image" alt="" height="28" width="28" />
          <span class="pl-1">
            <span :class="[effect.valueClass, 'text-no-wrap']">{{ effect.value }}</span> {{ effect.text }}
          </span>
        </div>
      </div>
    </v-col>
  </v-row>

  <v-row class="flex-left px-2 flex-nowrap" dense>
    <v-col cols="auto" class="flex-center">
      <v-img src="/images/misc/strength.png" alt="" height="40" width="40" />
    </v-col>
    <v-col class="flex-column status-col">
      <span class="text-strength text-no-wrap">{{ island.name }}</span>
      <div class="effect-list">
        <div class="flex-left">
          <span class="text-no-wrap">
            <span class="text-strength text-no-wrap">{{ areaBonus }}%</span> area bonus
          </span>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { berryImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { capitalize, hasSpecialty, type IslandInstance, type PokemonInstance } from 'sleepapi-common'
import { computed } from 'vue'
import {
  baseFavoriteBerryEffect,
  EXPERT_ISLAND_EFFECTS,
  expertBerryBonus,
  expertIngredientBonus,
  expertIngredientSpecialtyBonus,
  expertMainFavoriteSkillLevel,
  expertSkillChanceBonus,
  type IslandEffect
} from './island-effects'

const props = defineProps<{
  member: PokemonInstance
  island: IslandInstance
  effectiveSkillLevel: number
}>()

const userStore = useUserStore()

const expertMode = computed(() => (props.island.expert ? props.island.expertMode : undefined))

const expertEffects = computed(() => (expertMode.value ? EXPERT_ISLAND_EFFECTS[props.island.shortName] : undefined))

const memberBerry = computed(() => props.member.pokemon.berry)

const isMainFavorite = computed(() => expertMode.value?.mainFavoriteBerry.name === memberBerry.value.name)

const isSubFavorite = computed(
  () => expertMode.value?.subFavoriteBerries.some((b) => b.name === memberBerry.value.name) === true
)

const isBaseFavorite = computed(
  () => !props.island.expert && props.island.berries.some((b) => b.name === memberBerry.value.name)
)

const isFavored = computed(() => isMainFavorite.value || isSubFavorite.value)

const areaBonus = computed(() => Math.round((userStore.islandBonus(props.island.shortName) - 1) * 100))

const statusLabel = computed(() => {
  const berryName = capitalize(memberBerry.value.name)
  if (isMainFavorite.value) {
    return `${berryName} is the main favorite berry`
  }
  if (isSubFavorite.value) {
    return `${berryName} is a sub-favorite berry`
  }
  if (isBaseFavorite.value) {
    return `${berryName} is a favorite berry`
  }
  if (props.island.expert && !expertMode.value) {
    return 'No favorite berries selected'
  }
  return `${berryName} is not favored`
})

const effects = computed<IslandEffect[]>(() => {
  const result: IslandEffect[] = []

  if (isBaseFavorite.value) {
    result.push(baseFavoriteBerryEffect)
  } else if (expertMode.value && expertEffects.value) {
    if (isMainFavorite.value) {
      if (props.effectiveSkillLevel > props.member.skillLevel) {
        result.push(expertMainFavoriteSkillLevel)
      }
      result.push(...expertEffects.value.mainFavoriteExtraEffects)
    } else if (!isFavored.value) {
      result.push(...expertEffects.value.unfavoredExtraEffects)
    }

    if (isFavored.value) {
      if (expertMode.value.randomBonus === 'ingredient') {
        const ingredientSpecialist = hasSpecialty(props.member.pokemon, 'ingredient')
        result.push(ingredientSpecialist ? expertIngredientSpecialtyBonus : expertIngredientBonus)
      } else if (expertMode.value.randomBonus === 'berry') {
        result.push(expertBerryBonus)
      } else {
        result.push(expertSkillChanceBonus)
      }
    }
  }

  return result
})
</script>

<style scoped lang="scss">
.status-col {
  align-items: flex-start;
  gap: 2px;
}

.effect-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  @media (min-width: $desktop) {
    flex-direction: row;
    align-items: center;
    column-gap: 16px;
    flex-wrap: wrap;
  }
}
</style>
