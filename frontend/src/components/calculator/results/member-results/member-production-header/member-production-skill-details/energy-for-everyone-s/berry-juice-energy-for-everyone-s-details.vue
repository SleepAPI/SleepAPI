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
          :alt="`Berry Juice (Energy for Everyone) level ${effectiveSkillLevel}`"
          title="Berry Juice (Energy for Everyone)"
        ></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center num-skill-procs">{{
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
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1 energy-per-proc"
            >x{{ energyValuePerProc }}</span
          >
          <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1 juice-per-proc"
            >x{{ juicePerProc }}</span
          >
          <v-img
            src="/images/misc/berry-juice.png"
            height="20"
            width="20"
            alt="berry juice"
            title="berry juice"
          ></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1 energy-total"> {{ totalEnergyValue }} total</span>
      </div>
      <div class="flex-center mt-1">
        <v-img src="/images/misc/berry-juice.png" height="20" width="20" alt="berry juice" title="berry juice"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2 juice-total"> {{ totalJuice }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { EnergyForEveryoneSBerryJuice, MathUtils, compactNumber } from 'sleepapi-common'
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
    return { teamStore, skillLevelBadgeText, MathUtils, mainskillImage, berryImage }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    energyValuePerProc() {
      return EnergyForEveryoneSBerryJuice.activations.energy.amount({
        skillLevel: this.effectiveSkillLevel
      })
    },
    juicePerProc() {
      const juiceAmount =
        EnergyForEveryoneSBerryJuice.activations.juice.amount({
          skillLevel: this.effectiveSkillLevel
        }) * EnergyForEveryoneSBerryJuice.juicePercent
      return compactNumber(MathUtils.round(juiceAmount, 2))
    },
    totalEnergyValue() {
      return compactNumber(
        this.memberWithProduction.production.skillValue['energy'].amountToTeam * this.timeWindowFactor
      )
    },
    totalJuice() {
      const juiceAmount = MathUtils.round(this.memberWithProduction.production.skillValue.items?.amountToSelf ?? 0, 2)
      return compactNumber(juiceAmount)
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
