<template>
  <v-row class="align-stretch flex-top flex-nowrap" dense>
    <v-col class="">
      <MemberProductionBerry :member-with-production="member" />
    </v-col>

    <v-col>
      <MemberProductionIngredient :member-with-production="member" />
    </v-col>

    <v-col>
      <MemberProductionSkill :member-with-production="member" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import MemberProductionBerry from '@/components/calculator/results/member-results/member-production-berry.vue'
import MemberProductionIngredient from '@/components/calculator/results/member-results/member-production-ingredient.vue'
import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-skill.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionHeader',
  components: {
    MemberProductionSkill,
    MemberProductionBerry,
    MemberProductionIngredient
  },
  props: {
    member: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const pokemonStore = usePokemonStore()
    const teamStore = useTeamStore()
    return { pokemonStore, teamStore, MathUtils, mainskillImage, berryImage }
  },
  computed: {
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
