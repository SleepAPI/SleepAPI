<template>
  <v-row dense class="frosted-glass mt-0 mx-0">
    <v-col v-for="(recipe, index) in recipes" :key="recipe.name" cols="12" class="px-2">
      <v-card rounded="xl" class="pa-2">
        <div class="recipe-grid">
          <!-- Row 1: Name (Left) / Chip (Right) -->
          <div class="ml-2 font-weight-semibold">{{ recipe.displayName }}</div>
          <div class="right-column">
            <v-chip class="flex-center text-body-1" variant="outlined" color="strength">
              <img :src="'/images/misc/strength.png'" height="16" class="mr-1" />
              {{ localizeNumber(recipe.userStrength) }}
            </v-chip>
          </div>

          <!-- Row 2: Image + Stats (Left) / Level Button (Right) -->
          <div class="d-flex align-center">
            <img :src="recipeImage(recipe.name)" height="54" />
            <div class="d-flex flex-column ml-2">
              <span class="text-no-wrap">{{ recipe.nrOfIngredients }} ingredients</span>
              <span class="text-no-wrap">{{ recipe.bonus }}% bonus</span>
            </div>
          </div>
          <div class="right-column">
            <RecipeLevelButton
              v-model="recipe.level"
              :recipe-name="recipe.name"
              @updateLevel="onUpdateLevel(recipe, $event)"
            />
          </div>

          <!-- Row 3: Ingredients (Left) / Team Finder Button (Right) -->
          <div class="d-flex flex-nowrap">
            <div v-for="({ ingredient, amount }, index) in recipe.ingredients" :key="index" class="flex-center mr-2">
              <img :src="ingredientImage(ingredient.name)" height="24" />
              <span>{{ amount }}</span>
            </div>
          </div>
          <div class="right-column">
            <!-- <v-btn class="compact-x no-uppercase font-weight-light text-body-2" variant="text">
              Team finder <v-icon>mdi-chevron-right</v-icon>
            </v-btn> -->
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import RecipeLevelButton from '@/components/recipe/recipe-level-button.vue'
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import type { UserRecipe } from '@/types/recipe/user-recipe'
import { localizeNumber, MAX_RECIPE_LEVEL } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RecipeTableMobile',
  components: { RecipeLevelButton },
  props: {
    recipes: {
      type: Array as () => UserRecipe[],
      required: true
    }
  },
  setup() {
    const { highlightText } = useHighlightText()
    const userStore = useUserStore()
    const loggedIn = userStore.loggedIn
    return {
      recipeImage,
      ingredientImage,
      localizeNumber,
      MAX_RECIPE_LEVEL,
      highlightText,
      loggedIn
    }
  },
  emits: ['updateLevel'],
  methods: {
    onUpdateLevel(recipe: UserRecipe, newLevel: number) {
      this.$emit('updateLevel', recipe, newLevel)
    }
  }
})
</script>

<style scoped lang="scss">
.compact-x {
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.no-uppercase {
  text-transform: none !important;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto auto;
  gap: 0px;
  align-items: center;
}

.right-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
