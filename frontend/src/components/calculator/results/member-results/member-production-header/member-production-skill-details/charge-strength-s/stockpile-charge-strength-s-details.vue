<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-4">
      <v-badge
        id="skillLevelBadge"
        :content="skillLevelBadgeText(effectiveSkillLevel, baseSkillLevel)"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(memberWithProduction.member.pokemon)"
          height="40px"
          width="40px"
          :alt="`Stockpile (Charge Strength S) level ${effectiveSkillLevel}`"
          title="Stockpile (Charge Strength S)"
        ></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            MathUtils.round(memberWithProduction.production.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img
            src="/images/misc/skillproc.png"
            height="24"
            width="24"
            alt="skill activations"
            title="skill activations"
          ></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >{{ localizeNumber(skillValuePerProc) }} avg.</span
          >
          <v-img src="/images/unit/strength.png" height="20" width="20" alt="strength" title="strength"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/misc/strength.png" height="20" width="20" alt="strength" title="strength"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalSkillValue }} total </span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { applyAreaBonus, skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { ChargeStrengthSStockpile, MathUtils, compactNumber, localizeNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, skillLevelBadgeText, MathUtils, mainskillImage, localizeNumber }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    skillValuePerProc() {
      const rawAmount = ChargeStrengthSStockpile.activations.strength.amount({ skillLevel: this.effectiveSkillLevel })
      return applyAreaBonus(rawAmount, this.teamStore.getCurrentTeam.island.areaBonus)
    },
    totalSkillValue() {
      return compactNumber(this.memberWithProduction.production.strength.skill.total * this.timeWindowFactor, 'floor')
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
