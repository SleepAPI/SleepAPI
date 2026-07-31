<template>
  <v-row no-gutters class="frosted-glass">
    <v-col v-if="isLargeDesktop" class="flex-column d-flex pt-2 px-2">
      <span class="text-h4 font-weight-semibold pb-2">Recipes</span>
      <span v-if="loggedIn" class="text-strength text-body-1">
        Setting your recipe levels here will affect calculations across Neroli's Lab
      </span>
      <span v-else class="text-strength text-body-1"> Please log in to configure your recipe levels </span>
    </v-col>
    <v-data-table
      :items="reactiveRecipes"
      :headers="headers"
      key="key"
      item-value="name"
      class="bg-transparent"
      hide-default-footer
      items-per-page="-1"
      density="compact"
    >
      <template #[`item.image`]="{ item }">
        <v-avatar size="50" :color="item.type" rounded="0">
          <v-img :src="recipeImage(item.name)" :alt="`${item.displayName}`" :title="`${item.displayName}`" />
        </v-avatar>
      </template>

      <template #[`item.displayName`]="{ item }">
        <span class="text-no-wrap text-body-1 font-weight-semibold">{{ item.displayName }}</span>
        <div v-if="!isLargeDesktop" class="flex-nowrap ing-container">
          <div v-for="({ ingredient, amount }, index) in item.ingredients" :key="index" class="flex-left">
            <img
              :src="ingredientImage(ingredient.name)"
              height="24"
              :alt="`${ingredient.name}`"
              :title="`${ingredient.name}`"
            />
            <span>{{ amount }}</span>
          </div>
        </div>
      </template>

      <template #[`item.userStrength`]="{ item }">
        <v-row class="d-flex justify-space-between" dense>
          <v-col cols="auto">
            <img :src="'/images/misc/strength.png'" height="24" alt="strength" title="strength" />
          </v-col>
          <v-col class="flex-right">
            <span class="text-body-1">{{ localizeNumber(item.userStrength) }}</span>
          </v-col>
        </v-row>
      </template>

      <template #[`item.ingredients`]="{ item }">
        <div class="flex-left ing-container large">
          <div v-for="({ ingredient, amount }, index) in item.ingredients" :key="index" class="flex-left">
            <img :src="ingredientImage(ingredient.name)" height="28" />
            <span class="text-body-1">{{ amount }}</span>
          </div>
        </div>
      </template>

      <template #[`item.nrOfIngredients`]="{ item }">
        <span class="flex-right text-body-1">{{ item.nrOfIngredients }}</span>
      </template>

      <template #[`item.bonus`]="{ item }">
        <span class="flex-right text-body-1">{{ item.bonus }}%</span>
      </template>

      <template #[`item.level`]="{ item }">
        <RecipeLevelButton v-model="item.level" :recipe-name="item.name" @updateLevel="onUpdateLevel(item, $event)" />
      </template>
    </v-data-table>
  </v-row>
</template>

<script lang="ts">
import RecipeLevelButton from '@/components/recipe/recipe-level-button.vue'
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import type { UserRecipe } from '@/types/recipe/user-recipe'
import type { DataTableHeader } from '@/types/vuetify/table/table-header'
import { localizeNumber, MAX_RECIPE_LEVEL } from 'sleepapi-common'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'RecipeTableMobile',
  components: { RecipeLevelButton },
  props: {
    recipes: {
      type: Array as () => UserRecipe[],
      required: true
    }
  },
  setup(props) {
    const { highlightText } = useHighlightText()
    const userStore = useUserStore()
    const loggedIn = userStore.loggedIn
    const reactiveRecipes = ref([...props.recipes])

    const { isLargeDesktop } = useBreakpoint()

    const headers = computed(() => {
      const baseHeaders: DataTableHeader[] = [
        { key: 'image', width: '50px', sortable: false },
        {
          title: 'Name',
          key: 'displayName',
          sort: (a: string, b: string) => {
            const textA = a.replace(/[^\w\s]/gi, '').toLowerCase()
            const textB = b.replace(/[^\w\s]/gi, '').toLowerCase()
            return textA.localeCompare(textB)
          }
        },
        { title: 'Strength', key: 'userStrength', width: '130px', align: 'end' },
        { title: 'Size', key: 'nrOfIngredients', align: 'end' },
        { title: 'Bonus', key: 'bonus', align: 'end' },
        { title: 'Level', key: 'level' }
      ]

      if (isLargeDesktop.value) {
        baseHeaders.splice(2, 0, { title: 'Ingredients', key: 'ingredients', sortable: false })
      }

      return baseHeaders
    })

    watch(
      () => props.recipes,
      (newRecipes) => {
        reactiveRecipes.value = [...newRecipes]
      },
      { deep: true }
    )

    return {
      recipeImage,
      ingredientImage,
      localizeNumber,
      MAX_RECIPE_LEVEL,
      highlightText,
      loggedIn,
      recipes: props.recipes,
      headers,
      reactiveRecipes,
      isLargeDesktop
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
:deep(.v-table__wrapper) {
  overflow-y: hidden !important;
}

.ing-container {
  display: flex;
  gap: 8px;

  &.large {
    gap: 12px;
  }
}
</style>
