<template>
  <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
    <v-row dense class="flex-center">
      <v-col cols="12" class="flex-center text-h6 text-ingredient font-weight-medium"> Ings </v-col>
    </v-row>

    <v-row no-gutters class="fill-height justify-space-around flex-center flex-column">
      <v-row
        v-for="({ amount, name }, i) in member.ingredients"
        :key="i"
        no-gutters
        class="ingredient-row"
      >
        <v-col cols="auto">
          <v-img :src="name" height="28" width="28"></v-img>
        </v-col>
        <v-col cols="auto" style="min-width: 40px">
          <span class="font-weight-medium">
            x{{ MathUtils.round(amount * timeWindowFactor, 1) }}
          </span>
        </v-col>
      </v-row>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberInstanceProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionIngredient',
  props: {
    member: {
      type: Object as PropType<MemberInstanceProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, MathUtils }
  },
  computed: {
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
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
