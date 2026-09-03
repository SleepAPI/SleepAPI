<template>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex flex-column bg-transparent" rounded="0">
        <v-container>
          <v-row class="flex-center py-2">
            <v-col cols="auto" class="flex-center">
              <span class="text-h5">Weekly </span>
              <span id="weeklyStrength" class="text-h4 ml-2 text-strength font-weight-medium">
                {{ cookingStrength }}</span
              >
              <v-img src="/images/misc/strength.png" class="ml-2" width="30" height="30" contain />
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="auto" class="flex-left pt-0">
              <span class="text-body-1">Mon&ndash;Sat</span>
              <span
                id="weekdayStrength"
                :class="['text-body-1', 'mx-2', `text-${teamStore.getCurrentTeam.recipeType}`, 'font-weight-medium']"
              >
                {{ weekdayStrength }}</span
              >
              <div class="legend" :class="`bg-${teamStore.getCurrentTeam.recipeType}`">
                <v-img src="/images/misc/strength_black.png" width="20" height="20" contain />
              </div>
            </v-col>
            <v-col cols="auto" class="flex-right pt-0">
              <span class="text-body-1 flex-right">Sun</span>
              <span
                id="sundayStrength"
                :class="[
                  'text-body-1',
                  'mx-2',
                  'flex-right',
                  `text-${teamStore.getCurrentTeam.recipeType}-dark`,
                  'font-weight-medium'
                ]"
              >
                {{ sundayStrength }}
              </span>

              <div class="legend" :class="`bg-${teamStore.getCurrentTeam.recipeType}-dark`">
                <v-img src="/images/misc/strength_black.png" width="20" height="20" contain />
              </div>
            </v-col>
          </v-row>

          <Divider />

          <MealPlan @select-meal="openMealPlanSelection" />

          <Divider />

          <v-row v-if="mealTimes" class="flex-center" dense>
            <v-col cols="12" class="flex-center">
              <span class="text-h6 text-center"> Daily meal times </span>
            </v-col>
            <v-col v-for="meal in ['breakfast', 'lunch', 'dinner']" cols="12" class="meal-time">
              <v-img
                v-if="mealTimes[meal as keyof typeof mealTimes]"
                src="/images/misc/pot.png"
                width="20"
                height="20"
                contain
              />
              <v-img
                v-if="!mealTimes[meal as keyof typeof mealTimes]"
                src="/images/subskill/erb.png"
                width="20"
                height="20"
                contain
              />
              {{ mealTimeText(meal, mealTimes[meal as keyof typeof mealTimes]) }}
            </v-col>
          </v-row>

          <Divider />

          <v-row class="flex-center" dense>
            <v-col cols="12" class="flex-center">
              <span class="text-h6 text-center"> Daily team ingredients </span>
            </v-col>

            <v-col cols="12" class="flex-center ingredient-list">
              <div v-for="(ingredient, i) in teamIngredients" :key="i" class="ingredient">
                <v-img :src="`${ingredient.image}`" width="30" height="30" contain />
                {{ ingredient.amount }}
              </div>
            </v-col>
          </v-row>

          <template v-if="stockpiledIngredients.length > 0">
            <v-row class="flex-center" dense>
              <v-col cols="12" class="flex-center">
                <span class="text-h6 text-center"> Weekly starting ingredients </span>
              </v-col>

              <v-col cols="12" class="flex-center ingredient-list">
                <div v-for="(ingredient, i) in stockpiledIngredients" :key="i" class="ingredient">
                  <v-img :src="`${ingredient.image}`" width="30" height="30" contain />
                  {{ ingredient.amount }}
                </div>
              </v-col>
            </v-row>
          </template>

          <v-row class="flex-center" dense>
            <v-col cols="12" class="w-100">
              <v-divider />
            </v-col>
            <v-col cols="12" class="flex-center py-3">
              <span class="text-h6 text-center"> Split of recipes cooked </span>
            </v-col>
          </v-row>

          <v-row
            v-for="(cookedRecipe, index) in recipesCooked"
            :key="index"
            dense
            class="expansion-panel"
            @click="toggleDetails(index)"
          >
            <v-col cols="auto" class="flex-center pa-0 ma-0">
              <v-chip size="small" :color="teamStore.getCurrentTeam.recipeType" variant="tonal">
                Lv. {{ cookedRecipe.level }}
              </v-chip>
            </v-col>
            <v-col>
              {{ cookedRecipe.recipe.displayName }}
            </v-col>
            <v-col cols="auto" class="flex-center">
              <v-icon>
                {{ cookedRecipe.showDetails ? 'mdi-minus' : 'mdi-plus' }}
              </v-icon>
            </v-col>

            <v-col cols="12" class="flex-center">
              <v-img
                :src="`/images/recipe/${cookedRecipe.recipe.name.replace(/[_]/g, '').toLowerCase()}.png`"
                contain
                width="36"
                height="36"
                class="mr-2"
                :style="{
                  transform: 'scale(1.3)',
                  transformOrigin: 'center'
                }"
              />
              <v-progress-linear
                v-model="cookedRecipe.weekdayPercentage"
                :buffer-value="cookedRecipe.fullWeekPercentage"
                :buffer-color="`${teamStore.getCurrentTeam.recipeType}-dark`"
                buffer-opacity="1"
                :color="teamStore.getCurrentTeam.recipeType"
                height="25"
                class="flex-grow-1"
              >
                <span
                  :style="{
                    color: cookedRecipe.weekdayPercentage > 50 ? 'black' : 'white'
                  }"
                >
                  {{ cookedRecipe.fullWeekPercentage }}%
                </span>
              </v-progress-linear>
            </v-col>
            <v-row v-if="cookedRecipe.showDetails" class="flex-center w-100 py-4" dense>
              <v-col cols="12">
                <v-divider />
              </v-col>

              <v-col cols="3" class="flex-center"> Recipe </v-col>
              <v-col
                v-for="(ingredient, i) in cookedRecipe.recipe.ingredients"
                :key="i"
                class="flex-column flex-center"
                cols="2"
              >
                <v-img
                  :src="`/images/ingredient/${ingredient.ingredient.name.toLowerCase()}.png`"
                  width="24"
                  height="24"
                  cover
                  style="overflow: visible"
                />
                {{ ingredient.amount }}
              </v-col>

              <template v-if="totalCooks - (cookedRecipe.count + cookedRecipe.totalSkipped) > 0">
                <v-col cols="10">
                  <v-divider />
                </v-col>
                <v-col cols="12" class="flex-column flex-center text-h6">
                  <span> Better recipe was cooked: </span>
                  <span class="text-success text-h6">
                    {{ totalCooks - (cookedRecipe.count + cookedRecipe.totalSkipped) }}
                    ({{ round(((totalCooks - (cookedRecipe.count + cookedRecipe.totalSkipped)) / totalCooks) * 100) }}%)
                  </span>
                </v-col>
              </template>

              <v-col cols="12">
                <v-divider />
              </v-col>

              <v-col cols="12" class="flex-column flex-center text-center">
                <span class="text-h6">
                  Attempts:
                  {{ cookedRecipe.count + cookedRecipe.totalSkipped }}
                  ({{ round(((cookedRecipe.count + cookedRecipe.totalSkipped) / totalCooks) * 100) }}%)
                </span>
                <span>
                  Succeeded:
                  <span class="text-success text-h6">
                    {{ cookedRecipe.count }}
                    ({{ round((cookedRecipe.count / totalCooks) * 100) }}%)
                  </span>
                </span>
              </v-col>

              <template v-if="hasBeenSkipped(cookedRecipe)">
                <v-col cols="10">
                  <v-divider />
                </v-col>
                <v-col cols="12" class="flex-column text-center">
                  <span class="text-h6">
                    Failed:
                    <span class="text-primary">
                      {{ cookedRecipe.totalSkipped }}
                      ({{ round((cookedRecipe.totalSkipped / totalCooks) * 100) }}%)
                    </span>
                  </span>
                </v-col>

                <v-row class="flex-center pb-4 px-2">
                  <v-col v-if="cookedRecipe.potLimited.count > 0" cols="auto" class="flex-center flex-column">
                    <v-img :src="`/images/misc/pot.png`" contain width="24" height="24" />
                    <span>
                      Times:
                      {{ cookedRecipe.potLimited.count }}
                      ({{ round((cookedRecipe.potLimited.count / cookedRecipe.totalSkipped) * 100) }})%
                    </span>
                    <span>Amount: {{ round(cookedRecipe.potLimited.averageMissing) }}</span>
                  </v-col>
                  <v-col
                    v-for="(ingredientSet, innerIndex) in cookedRecipe.ingredientLimited.filter((ing) => ing.count > 0)"
                    :key="innerIndex"
                    class="flex-column flex-center"
                    cols="auto"
                  >
                    <v-img
                      :src="`/images/ingredient/${ingredientSet.ingredientName.toLowerCase()}.png`"
                      contain
                      width="24"
                      height="24"
                    />
                    <span
                      >Times: {{ ingredientSet.count }} ({{
                        round((ingredientSet.count / cookedRecipe.totalSkipped) * 100)
                      }})%</span
                    >
                    <span>Amount: {{ round(ingredientSet.averageMissing) }}</span>
                  </v-col>
                </v-row>
              </template>
            </v-row>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Divider from '@/components/custom-components/divider/divider.vue'
import MealPlan from '@/components/calculator/results/meal-plan.vue'
import { ingredientImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import {
  MathUtils,
  capitalize,
  combineSameIngredientsInDrop,
  getIsland,
  ingredient,
  prettifyTime,
  type CookedRecipeResult,
  type RecipeTypeResult,
  type Time
} from 'sleepapi-common'

export interface CookedRecipeResultDetails extends CookedRecipeResult {
  weekdayPercentage: number
  fullWeekPercentage: number
  showDetails: boolean
}

export default defineComponent({
  name: 'CookingResults',
  components: {
    Divider,
    MealPlan
  },
  data() {
    return {
      teamStore: useTeamStore(),
      pokemonStore: usePokemonStore(),
      userStore: useUserStore(),
      showDetailsState: [] as boolean[]
    }
  },
  computed: {
    currentRecipeTypeResult(): RecipeTypeResult | undefined {
      const team = this.teamStore.getCurrentTeam
      if (team.recipeType === 'curry') {
        return team.production?.team.cooking?.curry
      } else if (team.recipeType === 'salad') {
        return team.production?.team.cooking?.salad
      } else {
        return team.production?.team.cooking?.dessert
      }
    },
    mealTimes() {
      const mealTimes = this.teamStore.getCurrentTeam.production?.team.cooking?.mealTimes
      return {
        breakfast: mealTimes?.breakfast,
        lunch: mealTimes?.lunch,
        dinner: mealTimes?.dinner
      }
    },
    cookingStrength() {
      const strength = Math.floor(
        (this.currentRecipeTypeResult?.weeklyStrength ?? 0) *
          this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
      )
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(strength)
    },
    sundayStrength() {
      const strength = Math.floor(
        (this.currentRecipeTypeResult?.sundayStrength ?? 0) *
          this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
      )
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(strength)
    },
    weekdayStrength() {
      const weeklyStrength = Math.floor(
        (this.currentRecipeTypeResult?.weeklyStrength ?? 0) *
          this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
      )
      const sundayStrength = Math.floor(
        (this.currentRecipeTypeResult?.sundayStrength ?? 0) *
          this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
      )

      const strength = Math.floor(weeklyStrength - sundayStrength)
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(strength)
    },
    recipesCooked(): CookedRecipeResultDetails[] {
      const recipes = this.currentRecipeTypeResult?.cookedRecipes ?? []
      const total = recipes.reduce((sum, cur) => sum + cur.count, 0)

      return recipes
        .sort((a, b) => b.count - a.count)
        .map((cookedRecipe, index) => {
          const weekdayPercentage = MathUtils.round(((cookedRecipe.count - cookedRecipe.sunday) / total) * 100, 2)
          const fullWeekPercentage = MathUtils.round((cookedRecipe.count / total) * 100, 2)

          if (this.showDetailsState[index] === undefined) {
            this.showDetailsState[index] = false
          }

          return {
            ...cookedRecipe,
            weekdayPercentage,
            fullWeekPercentage,
            showDetails: this.showDetailsState[index]
          }
        })
    },
    teamIngredients() {
      const ingredients = combineSameIngredientsInDrop(
        this.teamStore.getCurrentTeam.production?.team.ingredients ?? []
      ).sort((a, b) => b.amount - a.amount)

      if (ingredients.length >= ingredient.INGREDIENTS.length) {
        const ingMagnetAmount = ingredients.reduce(
          (min, cur) => (cur.amount < min ? cur.amount : min),
          ingredients[0].amount
        )

        const nonIngMagnetIngs = ingredients
          .filter((ing) => ing.amount !== ingMagnetAmount)
          .map(({ amount, ingredient }) => ({
            amount: MathUtils.round(amount - ingMagnetAmount, 1),
            image: `/images/ingredient/${ingredient.name.toLowerCase()}.png`
          }))

        return nonIngMagnetIngs.concat({
          amount: MathUtils.round(ingMagnetAmount, 1),
          image: '/images/ingredient/ingredients.png'
        })
      } else {
        return ingredients.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount, 1),
          image: `/images/ingredient/${ingredient.name.toLowerCase()}.png`
        }))
      }
    },
    stockpiledIngredients() {
      const ingredients = this.teamStore.getCurrentTeam.stockpiledIngredients
        .filter((ing) => ing.amount > 0)
        .sort((a, b) => b.amount - a.amount)

      return ingredients.map(({ amount, name }) => ({
        amount: MathUtils.round(amount, 1),
        image: ingredientImage(name)
      }))
    },
    totalCooks() {
      const recipes = this.currentRecipeTypeResult?.cookedRecipes ?? []
      return recipes.reduce((sum, cur) => sum + cur.count, 0)
    }
  },
  methods: {
    openMealPlanSelection() {
      // The recipe picker is added in the next UI step.
    },
    toggleDetails(index: number) {
      this.showDetailsState[index] = !this.showDetailsState[index]
    },
    round(num: number) {
      return MathUtils.round(num, 2)
    },
    mealTimeText(mealName: string, time: Time | null | undefined) {
      if (!time) {
        return `You slept through ${mealName}!`
      }
      return `${capitalize(mealName)}: ${prettifyTime(time).slice(0, 5)}`
    },
    hasBeenSkipped(recipe: CookedRecipeResultDetails) {
      return recipe.potLimited.count > 0 || recipe.ingredientLimited.some((ing) => ing.count > 0)
    }
  }
})
</script>

<style lang="scss">
.expansion-panel {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.expansion-panel:hover {
  background-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.meal-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding-top: 0px;

  .v-img {
    flex-grow: 0;
  }
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .ingredient {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-basis: 75px;
    flex-shrink: 0;
    flex-grow: 1;
    max-width: 110px;

    @media (max-width: 600px) {
      flex-basis: 50px;
    }
  }
}
</style>
