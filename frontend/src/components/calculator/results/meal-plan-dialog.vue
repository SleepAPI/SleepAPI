<template>
  <v-dialog v-model="isOpen" max-width="760" scrollable aria-label="meal plan recipe selection">
    <v-card>
      <v-card-title>Select {{ meal ? capitalize(meal) : '' }} Recipe</v-card-title>
      <v-card-text>
        <v-row dense class="mb-2">
          <v-col>
            <CustomSearchBar v-model="searchQuery" density="compact" placeholder="Search recipes..." />
          </v-col>
          <v-col cols="auto">
            <DropdownSort
              v-model="selectedSort"
              v-model:sort-ascending="sortAscending"
              :sort-options="sortOptions"
              color="secondary"
            />
          </v-col>
        </v-row>

        <v-list class="bg-transparent pa-0">
          <v-list-item class="meal-plan-option" @click="selectChoice({ kind: 'best' })">
            <template #prepend>
              <v-avatar size="52" rounded="0">
                <v-img :src="bestRecipeImage" contain />
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-1 font-weight-medium">Best Recipe</v-list-item-title>
            <v-list-item-subtitle>Cook the best recipe available, without using important ingredients.</v-list-item-subtitle>
          </v-list-item>

          <v-list-item class="meal-plan-option" @click="selectChoice({ kind: 'none' })">
            <template #prepend>
              <div class="v-avatar meal-plan-option-icon">
                <img src="/images/misc/pot.png" alt="Cooking pot" class="none-pot-icon" />
              </div>
            </template>
            <v-list-item-title class="text-body-1 font-weight-medium">None</v-list-item-title>
            <v-list-item-subtitle>Skip this meal and preserve cooking bonuses for later meals.</v-list-item-subtitle>
            <template #append>
              <div class="meal-plan-option-stats">
                <span><v-img src="/images/misc/strength.png" width="18" height="18" />0</span>
                <span><v-img src="/images/misc/pot.png" width="18" height="18" />0</span>
              </div>
            </template>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item
            v-for="recipe in filteredRecipes"
            :key="recipe.name"
            class="meal-plan-option recipe-option"
            @click="selectChoice({ kind: 'recipe', recipe: recipe.name })"
          >
            <template #prepend>
              <v-avatar size="52" rounded="0">
                <v-img :src="recipeImage(recipe.name)" :alt="recipe.displayName" contain />
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-1 font-weight-medium">{{ recipe.displayName }}</v-list-item-title>
            <v-list-item-subtitle class="recipe-ingredients">
              <span v-for="({ ingredient, amount }, index) in recipe.ingredients" :key="index">
                <v-img :src="ingredientImage(ingredient.name)" width="20" height="20" />{{ amount }}
              </span>
            </v-list-item-subtitle>
            <template #append>
              <div class="meal-plan-option-stats">
                <span><v-img src="/images/misc/strength.png" width="18" height="18" />{{ localizeNumber(recipe.userStrength) }}</span>
                <span><v-img src="/images/misc/pot.png" width="18" height="18" />{{ recipe.nrOfIngredients }}</span>
              </div>
            </template>
          </v-list-item>

          <v-list-item v-if="filteredRecipes.length === 0" class="text-center text-medium-emphasis">
            No recipes match your search.
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="isOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import DropdownSort from '@/components/custom-components/dropdown-sort/DropdownSort.vue'
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import { UserService } from '@/services/user/user-service'
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { UserRecipe } from '@/types/recipe/user-recipe'
import {
  calculateRecipeValue,
  capitalize,
  localizeNumber,
  RECIPES,
  type MealPlanChoice,
  type MealSlot,
  type Recipe
} from 'sleepapi-common'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
  meal?: MealSlot
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [choice: MealPlanChoice]
}>()

const teamStore = useTeamStore()
const userStore = useUserStore()
const searchQuery = ref('')
const selectedSort = ref('value')
const sortAscending = ref(false)
const recipeLevels = ref<Record<string, number>>({})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const bestRecipeImage = computed(() => {
  const type = teamStore.getCurrentTeam.recipeType
  return type === 'dessert' ? '/images/recipe/mixedjuice.png' : `/images/recipe/mixed${type}.png`
})

const sortOptions = [
  { value: 'value', title: 'Strength', description: 'Strength at your recipe level' },
  { value: 'baseValue', title: 'Base Strength', description: 'Strength at level 1' },
  { value: 'level', title: 'Level', description: 'Your recipe level' },
  { value: 'ingredientCount', title: 'Size', description: 'Required pot size' },
  { value: 'recipeBonus', title: 'Bonus %', description: 'Recipe bonus' },
  { value: 'name', title: 'Name', description: 'Recipe name' }
]

const recipes = computed<UserRecipe[]>(() =>
  RECIPES.filter((recipe) => recipe.type === teamStore.getCurrentTeam.recipeType).map((recipe) => {
    const level = recipeLevels.value[recipe.name] ?? 1
    return {
      ...recipe,
      level,
      userStrength: calculateRecipeValue({ bonus: recipe.bonus, ingredients: recipe.ingredients, level })
    }
  })
)

const filteredRecipes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const matched = recipes.value
    .map((recipe) => ({ recipe, score: recipeSearchScore(recipe, query) }))
    .filter(({ score }) => score !== undefined)

  const direction = sortAscending.value ? 1 : -1
  return matched
    .sort((a, b) => {
      const valueA = sortValue(a.recipe)
      const valueB = sortValue(b.recipe)
      const comparison = typeof valueA === 'string' ? valueA.localeCompare(valueB as string) : valueA - (valueB as number)
      return comparison === 0 ? (a.score ?? 0) - (b.score ?? 0) : comparison * direction
    })
    .map(({ recipe }) => recipe)
})

onMounted(async () => {
  if (userStore.loggedIn) {
    recipeLevels.value = await UserService.getRecipes()
  }
})

function selectChoice(choice: MealPlanChoice) {
  emit('select', choice)
  isOpen.value = false
}

function sortValue(recipe: UserRecipe): number | string {
  switch (selectedSort.value) {
    case 'baseValue':
      return recipe.value
    case 'level':
      return recipe.level
    case 'ingredientCount':
      return recipe.nrOfIngredients
    case 'recipeBonus':
      return recipe.bonus
    case 'name':
      return recipe.displayName
    default:
      return recipe.userStrength
  }
}

function recipeSearchScore(recipe: Recipe, query: string): number | undefined {
  if (!query) return 0
  const text = [recipe.displayName, recipe.name, recipe.type, ...recipe.ingredients.map(({ ingredient }) => ingredient.name)]
    .join(' ')
    .toLowerCase()

  let score = 0
  let position = 0
  for (const character of query) {
    const match = text.indexOf(character, position)
    if (match === -1) return undefined
    score += match - position
    position = match + 1
  }
  return score
}
</script>

<style scoped lang="scss">
.meal-plan-option {
  cursor: pointer;
}

.meal-plan-option-icon {
  align-items: center;
  display: flex;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.none-pot-icon {
  height: 42px;
  object-fit: contain;
  width: 42px;
}

.meal-plan-option:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.meal-plan-option-stats {
  display: grid;
  font-size: 0.75rem;
  gap: 8px;
  grid-template-columns: repeat(2, max-content);
}

.meal-plan-option-stats span,
.recipe-ingredients span {
  align-items: center;
  display: flex;
  gap: 2px;
}

.recipe-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
