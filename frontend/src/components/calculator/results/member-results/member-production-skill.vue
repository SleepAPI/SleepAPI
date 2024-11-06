<template>
  <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
    <v-row no-gutters class="flex-center">
      <v-col cols="12" class="flex-center text-h6 text-skill font-weight-medium"> Skill </v-col>
    </v-row>

    <v-row no-gutters class="flex-center fill-height">
      <component :is="skillComponent" :member="member"></component>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import ChargeEnergySDetails from '@/components/calculator/results/member-results/member-production-skill-details/charge-energy-s-details.vue'
import ChargeStrengthMDetails from '@/components/calculator/results/member-results/member-production-skill-details/charge-strength-m-details.vue'
import ChargeStrengthSDetails from '@/components/calculator/results/member-results/member-production-skill-details/charge-strength-s-details.vue'
import ChargeStrengthSRangeDetails from '@/components/calculator/results/member-results/member-production-skill-details/charge-strength-s-range-details.vue'
import CookingPowerUpSDetails from '@/components/calculator/results/member-results/member-production-skill-details/cooking-power-up-s-details.vue'
import DisguiseBerryBurstDetails from '@/components/calculator/results/member-results/member-production-skill-details/disguise-berry-burst-details.vue'
import DreamShardMagnetSDetails from '@/components/calculator/results/member-results/member-production-skill-details/dream-shard-magnet-s-details.vue'
import DreamShardMagnetSRangeDetails from '@/components/calculator/results/member-results/member-production-skill-details/dream-shard-magnet-s-range-details.vue'
import EnergizingCheerSDetails from '@/components/calculator/results/member-results/member-production-skill-details/energizing-cheer-s-details.vue'
import EnergyForEveryoneDetails from '@/components/calculator/results/member-results/member-production-skill-details/energy-for-everyone-details.vue'
import ExtraHelpfulSDetails from '@/components/calculator/results/member-results/member-production-skill-details/extra-helpful-s-details.vue'
import HelperBoostDetails from '@/components/calculator/results/member-results/member-production-skill-details/helper-boost-details.vue'
import IngredientMagnetSDetails from '@/components/calculator/results/member-results/member-production-skill-details/ingredient-magnet-s-details.vue'
import MetronomeDetails from '@/components/calculator/results/member-results/member-production-skill-details/metronome-details.vue'
import MoonlightChargeEnergySDetails from '@/components/calculator/results/member-results/member-production-skill-details/moonlight-charge-energy-s-details.vue'
import StockpileChargeStrengthSDetails from '@/components/calculator/results/member-results/member-production-skill-details/stockpile-charge-strength-s-details.vue'
import TastyChanceSDetails from '@/components/calculator/results/member-results/member-production-skill-details/tasty-chance-s-details.vue'
import { mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberInstanceProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionSkill',
  components: {
    ChargeEnergySDetails,
    IngredientMagnetSDetails,
    DisguiseBerryBurstDetails,
    EnergizingCheerSDetails,
    MetronomeDetails,
    ChargeStrengthSDetails,
    ChargeStrengthSRangeDetails,
    ChargeStrengthMDetails,
    CookingPowerUpSDetails,
    DreamShardMagnetSDetails,
    DreamShardMagnetSRangeDetails,
    EnergyForEveryoneDetails,
    TastyChanceSDetails,
    StockpileChargeStrengthSDetails,
    MoonlightChargeEnergySDetails,
    HelperBoostDetails,
    ExtraHelpfulSDetails
  },
  props: {
    member: {
      type: Object as PropType<MemberInstanceProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, MathUtils, mainskillImage }
  },
  computed: {
    skillComponent() {
      const skillName = this.member.pokemonInstance.pokemon.skill.name
      return `${skillName.replace(/[(),\s]/g, '')}Details`
    }
  }
})
</script>
