<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-2 pb-1">
      <v-badge
        id="skillLevelBadge"
        :content="`Lv.${memberWithProduction.member.skillLevel}`"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(memberWithProduction.member.pokemon)"
          height="40px"
          width="40px"
        ></v-img>
      </v-badge>
      <div class="ml-1">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            MathUtils.round(memberWithProduction.production.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img src="/images/misc/skillproc.png" max-height="28" max-width="28px"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ skillValuePerProc }}</span
          >
          <v-img src="/images/unit/energy.png" height="20" width="20"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ critValuePerProc }}</span
          >
          <v-img src="/images/unit/energy_crit.png" height="20" width="20"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1">
          {{ selfSkillValue }} total</span
        >
      </div>
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1">
          {{ teamSkillValue }} team</span
        >
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils, compactNumber, mainskill } from 'sleepapi-common'
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
    return { teamStore, MathUtils, mainskillImage }
  },
  computed: {
    skillValuePerProc() {
      return this.memberWithProduction.member.pokemon.skill.amount(
        this.memberWithProduction.member.skillLevel
      )
    },
    critValuePerProc() {
      return (
        this.memberWithProduction.member.pokemon.skill.amount(
          this.memberWithProduction.member.skillLevel
        ) * mainskill.MOONLIGHT_CHARGE_ENERGY_CRIT_FACTOR
      )
    },
    selfSkillValue() {
      return compactNumber(
        StrengthService.skillValue({
          skill: this.memberWithProduction.member.pokemon.skill,
          amount:
            this.memberWithProduction.production.skillAmount -
            this.memberWithProduction.production.advanced.skillCritValue,
          timeWindow: this.teamStore.timeWindow
        })
      )
    },
    teamSkillValue() {
      return compactNumber(
        StrengthService.skillValue({
          skill: this.memberWithProduction.member.pokemon.skill,
          amount: this.memberWithProduction.production.advanced.skillCritValue,
          timeWindow: this.teamStore.timeWindow
        })
      )
    },
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
