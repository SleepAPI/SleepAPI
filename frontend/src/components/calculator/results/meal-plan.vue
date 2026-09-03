<template>
  <v-row
    class="meal-plan-header flex-center"
    role="button"
    tabindex="0"
    :aria-expanded="isExpanded"
    @click="toggleExpanded"
    @keyup.enter="toggleExpanded"
    @keyup.space.prevent="toggleExpanded"
  >
    <v-col cols="12" class="flex-center">
      <span class="text-h6 text-center">Meal plan</span>
    </v-col>
    <v-col cols="auto" class="meal-plan-toggle-icon flex-center">
      <v-icon>{{ isExpanded ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
    </v-col>
  </v-row>

  <v-row v-if="isExpanded" class="flex-center" dense>
    <v-col v-for="meal in meals" :key="meal" cols="4" class="meal-plan-column">
      <v-btn
        class="meal-plan-tile text-none"
        variant="tonal"
        :color="teamStore.getCurrentTeam.recipeType"
        :aria-label="`select ${meal} recipe`"
        @click="$emit('select-meal', meal)"
      >
        <span class="meal-plan-tile-content">
          <span class="meal-plan-title text-body-1 text-capitalize font-weight-medium">{{ meal }}</span>
          <span class="meal-plan-image-frame">
            <v-img
              :src="choiceImage(meal)"
              contain
              :class="['meal-plan-image', `meal-plan-image--${choice(meal).kind}`]"
            />
          </span>
          <span class="meal-plan-selection">
            <template v-if="choice(meal).kind === 'recipe'">
              <span class="meal-plan-selection-name text-body-1 text-center">{{ recipeFor(meal)?.displayName }}</span>
              <span class="meal-plan-stats">
                <span class="meal-plan-stat">
                  <v-img src="/images/misc/strength.png" contain class="meal-plan-stat-icon" />
                  {{ recipeFor(meal)?.value }}
                </span>
                <span class="meal-plan-stat">
                  <v-img src="/images/misc/pot.png" contain class="meal-plan-stat-icon" />
                  {{ recipeFor(meal)?.nrOfIngredients }}
                </span>
              </span>
            </template>
            <template v-else-if="choice(meal).kind === 'none'">
              <span class="text-body-1">None</span>
              <span class="meal-plan-stats">
                <span class="meal-plan-stat">
                  <v-img src="/images/misc/strength.png" contain class="meal-plan-stat-icon" />0
                </span>
                <span class="meal-plan-stat">
                  <v-img src="/images/misc/pot.png" contain class="meal-plan-stat-icon" />0
                </span>
              </span>
            </template>
            <span v-else class="text-body-1">Best Recipe</span>
          </span>
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
    isExpanded: false,
    meals: ['breakfast', 'lunch', 'dinner'] as MealSlot[]
  }),
  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded
    },
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
.meal-plan-header {
  cursor: pointer;
  position: relative;
}

.meal-plan-toggle-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.meal-plan-column {
  container-type: inline-size;
  display: flex;
}

.meal-plan-tile {
  box-sizing: border-box;
  height: clamp(230px, 74cqw, 340px);
  min-width: 0;
  overflow: hidden;
  padding: 0;
  width: 100%;

  :deep(.v-btn__content) {
    display: block;
    height: 100%;
    width: 100%;
  }
}

.meal-plan-tile-content {
  align-items: center;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100%;
  justify-items: center;
  min-height: 0;
  padding: clamp(8px, 3cqw, 16px) clamp(8px, 3cqw, 16px) clamp(12px, 5cqw, 24px);
  width: 100%;
}

.meal-plan-title {
  align-self: start;
  font-size: clamp(0.75rem, 6cqw, 1rem) !important;
}

.meal-plan-image-frame {
  align-self: center;
  display: block;
  height: clamp(96px, 20vw, 144px);
  max-height: 100%;
  position: relative;
  width: clamp(96px, 20vw, 144px);
}

.meal-plan-image {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transform-origin: center;
  width: 100%;
}

.meal-plan-image--best {
  transform: scale(1.1);
}

.meal-plan-image--none {
  transform: scale(0.65);
}

.meal-plan-selection {
  align-items: center;
  align-self: end;
  display: flex;
  flex-direction: column;
  font-size: clamp(0.75rem, 6cqw, 1rem) !important;
  gap: clamp(4px, 3cqw, 8px);
  justify-content: flex-start;
  min-height: clamp(52px, 14cqw, 64px);
  max-width: 100%;
  position: relative;
  bottom: clamp(16px, 6cqw, 32px);
  width: 100%;
}

.meal-plan-selection-name {
  overflow-wrap: anywhere;
  white-space: normal;
}

.meal-plan-stats {
  display: flex;
  gap: clamp(6px, 5cqw, 14px);
}

.meal-plan-stat {
  align-items: center;
  display: flex;
  font-size: clamp(0.75rem, 5cqw, 0.9rem);
  gap: clamp(2px, 2cqw, 4px);
}

.meal-plan-stat-icon {
  height: clamp(16px, 8cqw, 22px);
  width: clamp(16px, 8cqw, 22px);
}
</style>
