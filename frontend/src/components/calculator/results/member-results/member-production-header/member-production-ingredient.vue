<template>
  <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
    <v-row dense class="flex-center">
      <v-col cols="12" class="flex-center text-h6 text-ingredient font-weight-medium">
        {{ isMobile ? 'Ings' : 'Ingredients' }}
      </v-col>
    </v-row>

    <v-row no-gutters class="fill-height justify-space-around flex-center flex-column">
      <v-row
        v-for="({ amount, image }, i) in memberWithIngredientImages.ingredients"
        :key="i"
        no-gutters
        class="ingredient-row"
      >
        <v-col cols="auto">
          <v-img :src="image" height="28" width="28"></v-img>
        </v-col>
        <v-col cols="auto" style="min-width: 40px">
          <span class="font-weight-medium"> x{{ MathUtils.round(amount * timeWindowFactor, 1) }} </span>
        </v-col>
      </v-row>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { MathUtils, type IngredientSet } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionIngredient',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    const { isMobile } = useBreakpoint()
    return { teamStore, MathUtils, isMobile }
  },
  computed: {
    memberWithIngredientImages() {
      return {
        ...this.memberWithProduction,
        ingredients: this.prepareMemberIngredients(this.memberWithProduction.production.produceWithoutSkill.ingredients)
      }
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  },
  methods: {
    prepareMemberIngredients(ingredients: IngredientSet[]) {
      return ingredients.map(({ amount, ingredient }) => ({
        amount: MathUtils.round(amount, 1),
        image: `/images/ingredient/${ingredient.name.toLowerCase()}.png`
      }))
    }
  }
})
</script>

<style lang="scss">
.ingredient-row {
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
}
</style>
