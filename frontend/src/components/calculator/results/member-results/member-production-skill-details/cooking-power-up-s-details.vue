<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-4">
      <v-badge
        id="skillLevelBadge"
        :content="`Lv.${member.pokemonInstance.skillLevel}`"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(member.pokemonInstance.pokemon)"
          height="40px"
          width="40px"
        ></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            MathUtils.round(member.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img src="/images/misc/skillproc.png" max-height="28" max-width="28px"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ skillValuePerProc }}</span
          >
          <v-img src="/images/unit/pot.png" height="20" width="20"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/pot.png" height="20" width="20"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1">
          {{ totalSkillValue }} total</span
        >
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberInstanceProductionExt } from '@/types/member/instanced'
import { MathUtils, compactNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
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
    skillValuePerProc() {
      return this.member.pokemonInstance.pokemon.skill.amount(
        this.member.pokemonInstance.skillLevel
      )
    },
    totalSkillValue() {
      return compactNumber(
        StrengthService.skillValue({
          skill: this.member.pokemonInstance.pokemon.skill,
          amount: this.member.skillAmount,
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
