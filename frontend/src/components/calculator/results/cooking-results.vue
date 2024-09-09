<template>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex flex-column frosted-glass" rounded="0">
        <v-container>
          <v-row class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-h5">Weekly </span>
              <span id="weeklyStrength" class="text-h4 ml-2 text-accent">
                {{ cookingStrength }}</span
              >
              <v-img src="/images/misc/strength.png" class="ml-2" width="30" height="30" contain />
            </v-col>
            <v-col cols="auto" class="flex-left pt-0">
              <span class="text-body-2">Mon&ndash;Sat</span>
              <span
                id="weekdayStrength"
                :class="['text-body-1', 'ml-2', `text-${teamStore.getCurrentTeam.recipeType}`]"
              >
                {{ weekdayStrength }}</span
              >
              <v-img src="/images/misc/strength.png" class="ml-2" width="20" height="20" contain />
            </v-col>
            <v-col cols="auto" class="flex-right pt-0">
              <span class="text-body-2 flex-right">Sun </span>
              <span id="sundayStrength" class="text-body-1 ml-2 text-blue flex-right">
                {{ sundayStrength }}</span
              >
              <v-img src="/images/misc/strength.png" class="ml-2" width="20" height="20" contain />
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="12" class="flex-center">
              <v-card class="flex-center w-100" elevation="0" color="surface">
                <span class="d-flex w-100 align-center justify-center text-center">
                  Split of total recipes cooked
                </span>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-for="(recipe, index) in recipesCooked" :key="index" dense>
            <v-col cols="12" class="text-center">
              {{ recipe.name.replace(/[_]/g, ' ') }}
            </v-col>
            <v-col cols="12" class="flex-center">
              <v-img
                :src="`/images/recipe/${recipe.name.replace(/[_]/g, '').toLowerCase()}.png`"
                contain
                width="36"
                height="36"
                class="mr-2"
              />
              <v-progress-linear
                v-model="recipe.weekdayPercentage"
                :buffer-value="recipe.fullWeekPercentage"
                buffer-color="blue"
                buffer-opacity="1"
                :color="teamStore.getCurrentTeam.recipeType"
                height="25"
                class="flex-grow-1"
              >
                {{ recipe.fullWeekPercentage }}%
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { MathUtils, type RecipeTypeResult } from 'sleepapi-common'
export default defineComponent({
  name: 'CookingResults',
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    return { teamStore, pokemonStore, userStore }
  },
  data: () => ({
    tab: null
  }),
  computed: {
    currentRecipeTypeResult(): RecipeTypeResult | undefined {
      if (this.teamStore.getCurrentTeam.recipeType === 'curry') {
        return this.teamStore.getCurrentTeam.production?.team.cooking.curry
      } else if (this.teamStore.getCurrentTeam.recipeType === 'salad') {
        return this.teamStore.getCurrentTeam.production?.team.cooking.salad
      } else {
        return this.teamStore.getCurrentTeam.production?.team.cooking.dessert
      }
    },
    cookingStrength() {
      const strength = Math.floor(
        (this.currentRecipeTypeResult?.weeklyStrength ?? 0) * this.userStore.islandBonus
      )
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(strength)
    },
    sundayStrength() {
      const strength = Math.floor(
        (this.currentRecipeTypeResult?.sundayStrength ?? 0) * this.userStore.islandBonus
      )
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(strength)
    },
    weekdayStrength() {
      const weeklyStrength = Math.floor(
        (this.currentRecipeTypeResult?.weeklyStrength ?? 0) * this.userStore.islandBonus
      )
      const sundayStrength = Math.floor(
        (this.currentRecipeTypeResult?.sundayStrength ?? 0) * this.userStore.islandBonus
      )

      const strength = Math.floor(weeklyStrength - sundayStrength)
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(strength)
    },
    recipesCooked() {
      const recipes = this.currentRecipeTypeResult?.cookedRecipes ?? []
      const total = recipes.reduce((sum, cur) => sum + cur.count, 0)
      return recipes
        .sort((a, b) => b.count - a.count)
        .map(({ count, recipe, sunday }) => ({
          name: recipe.name,
          weekdayPercentage: MathUtils.round(((count - sunday) / total) * 100, 2),
          fullWeekPercentage: MathUtils.round((count / total) * 100, 2)
        }))
    }
  }
})
</script>
