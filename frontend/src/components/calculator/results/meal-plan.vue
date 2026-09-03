<template>
  <v-row class="flex-center" dense>
    <v-col cols="12" class="flex-center">
      <span class="text-h6 text-center">Meal Plan</span>
    </v-col>

    <v-col v-for="meal in meals" :key="meal" cols="4" class="meal-plan-column">
      <v-btn
        class="meal-plan-tile text-none"
        variant="tonal"
        :color="teamStore.getCurrentTeam.recipeType"
        :aria-label="`select ${meal} recipe`"
        @click="$emit('select-meal', meal)"
      >
        <span class="meal-plan-title text-body-1 text-capitalize font-weight-medium">{{ meal }}</span>
        <v-img :src="choiceImage(meal)" width="144" height="144" contain class="meal-plan-image" />
        <span class="meal-plan-selection">
          <template v-if="choice(meal).kind === 'recipe'">
            <span class="text-body-1 text-center text-wrap">{{ recipeFor(meal)?.displayName }}</span>
            <span class="meal-plan-stats">
              <span class="meal-plan-stat">
                <v-img src="/images/misc/strength.png" width="16" height="16" contain />
                {{ recipeFor(meal)?.value }}
              </span>
              <span class="meal-plan-stat">
                <v-img src="/images/misc/pot.png" width="16" height="16" contain />
                {{ recipeFor(meal)?.nrOfIngredients }}
              </span>
            </span>
          </template>
          <template v-else-if="choice(meal).kind === 'none'">
            <span class="text-body-1">None</span>
            <span class="meal-plan-stats">
              <span class="meal-plan-stat">
                <v-img src="/images/misc/strength.png" width="16" height="16" contain />0
              </span>
              <span class="meal-plan-stat">
                <v-img src="/images/misc/pot.png" width="16" height="16" contain />0
              </span>
            </span>
          </template>
          <span v-else class="text-body-1">Best Recipe</span>
        </span>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { recipeImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { defaultMealPlan, getRecipe, type MealPlanChoice, type MealSlot } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MealPlan',
  emits: ['select-meal'],
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, recipeImage }
  },
  data: () => ({
    meals: ['breakfast', 'lunch', 'dinner'] as MealSlot[]
  }),
  methods: {
    choice(meal: MealSlot): MealPlanChoice {
      return this.teamStore.getCurrentTeam.mealPlan?.[meal] ?? defaultMealPlan()[meal]
    },
    recipeFor(meal: MealSlot) {
      const choice = this.choice(meal)
      return choice.kind === 'recipe' ? getRecipe(choice.recipe) : undefined
    },
    choiceImage(meal: MealSlot) {
      const choice = this.choice(meal)
      if (choice.kind === 'recipe') {
        return this.recipeImage(choice.recipe)
      }
      if (choice.kind === 'none') {
        return '/images/misc/pot.png'
      }
      const type = this.teamStore.getCurrentTeam.recipeType
      return type === 'dessert' ? '/images/recipe/mixedjuice.png' : `/images/recipe/mixed${type}.png`
    }
  }
})
</script>

<style scoped lang="scss">
.meal-plan-column {
  display: flex;
}

.meal-plan-tile {
  height: 232px;
  min-width: 0;
  padding: 8px;
  width: 100%;

  :deep(.v-btn__content) {
    align-items: center;
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    height: 100%;
    justify-items: center;
    width: 100%;
  }
}

.meal-plan-title {
  align-self: start;
}

.meal-plan-image {
  align-self: center;
}

.meal-plan-selection {
  align-items: center;
  align-self: end;
  display: flex;
  flex-direction: column;
  min-height: 24px;
}

.meal-plan-stats {
  display: flex;
  gap: 8px;
}

.meal-plan-stat {
  align-items: center;
  display: flex;
  font-size: 0.75rem;
  gap: 2px;
}
</style>
