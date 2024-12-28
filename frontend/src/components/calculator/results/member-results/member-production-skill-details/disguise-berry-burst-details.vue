<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-4">
      <v-badge
        id="skillLevelBadge"
        :content="`Lv.${memberWithProduction.member.skillLevel}`"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img :src="mainskillImage(memberWithProduction.member.pokemon)" height="40px" width="40px"></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            MathUtils.round(memberWithProduction.production.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img src="/images/misc/skillproc.png" max-height="28" max-width="28px"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ skillValuePerProc }}-{{ skillValuePerProc * critModifier }}</span
          >
          <v-img src="/images/berries/berries.png" height="20" width="20"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img :src="berryImage(memberWithProduction.member.pokemon.berry)" height="20" width="20"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ skillValueSelf }} {{ berryName }}</span>
      </div>
      <div class="flex-center">
        <v-img src="/images/berries/berries.png" height="20" width="20"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ skillValueTeam }} team </span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
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
    const critModifier = mainskill.DISGUISE_CRIT_MULTIPLIER
    return { teamStore, MathUtils, mainskillImage, critModifier, berryImage }
  },
  computed: {
    berryName() {
      return this.memberWithProduction.member.pokemon.berry.name.toLowerCase()
    },
    skillValuePerProc() {
      return this.memberWithProduction.member.pokemon.skill.amount(this.memberWithProduction.member.skillLevel)
    },
    skillValueSelf() {
      const amount =
        this.memberWithProduction.production.produceFromSkill.berries.find(
          (b) => b.berry.name === this.memberWithProduction.member.pokemon.berry.name
        )?.amount ?? 0
      return compactNumber(
        StrengthService.skillValue({
          skill: this.memberWithProduction.member.pokemon.skill,
          amount,
          timeWindow: this.teamStore.timeWindow
        })
      )
    },
    skillValueTeam() {
      const amount = this.memberWithProduction.production.produceFromSkill.berries.reduce(
        (sum, cur) => sum + (cur.berry.name !== this.memberWithProduction.member.pokemon.berry.name ? cur.amount : 0),
        0
      )
      return compactNumber(
        StrengthService.skillValue({
          skill: this.memberWithProduction.member.pokemon.skill,
          amount,
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
