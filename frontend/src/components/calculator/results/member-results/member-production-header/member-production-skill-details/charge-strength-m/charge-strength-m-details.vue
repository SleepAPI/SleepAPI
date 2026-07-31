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
          :alt="`Charge Strength M level ${effectiveSkillLevel}`"
          title="Charge Strength M"
        ></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            compactNumber(memberWithProduction.production.skillProcs * timeWindowFactor)
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
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ localizeNumber(skillValuePerProc) }}</span
          >
          <v-img src="/images/unit/strength.png" height="20" width="20" alt="strength" title="strength"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/misc/strength.png" height="20" width="20" alt="strength" title="strength"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalSkillValue }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { applyAreaBonus, skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { ChargeStrengthM, compactNumber, localizeNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, skillLevelBadgeText, mainskillImage, compactNumber, localizeNumber }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    skillValuePerProc() {
      const rawAmount = ChargeStrengthM.activations.strength.amount({ skillLevel: this.effectiveSkillLevel })
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
