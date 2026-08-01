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
          :alt="`Minus (Cooking Power-Up S) level ${effectiveSkillLevel}`"
          title="Minus (Cooking Power-Up S)"
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
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ skillValuePerProc }}</span
          >
          <v-img
            src="/images/unit/pot.png"
            height="20"
            width="20"
            alt="cooking pot size"
            title="cooking pot size"
          ></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img
          src="/images/unit/pot.png"
          height="20"
          width="20"
          alt="cooking pot size"
          title="cooking pot size"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalPotValue }} total</span>
      </div>
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalEnergyValue }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { CookingPowerUpSMinus, MathUtils, compactNumber, isPlusOrMinus } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'CookingPowerUpSMinusDetails',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    return { teamStore, skillLevelBadgeText, pokemonStore, MathUtils, mainskillImage }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    skillValuePerProc() {
      return CookingPowerUpSMinus.activations.solo.amount({
        skillLevel: this.effectiveSkillLevel
      })
    },
    totalPotValue() {
      return compactNumber(
        this.memberWithProduction.production.skillValue['pot size'].amountToSelf * this.timeWindowFactor
      )
    },
    totalEnergyValue() {
      const teamMembers = this.teamStore.getCurrentTeam.members
        .filter(Boolean)
        .map((member) => this.pokemonStore.getPokemon(member!)!.pokemon)
      const isPaired = teamMembers.filter((member) => isPlusOrMinus(member.skill)).length > 1
      const energyAmountToSelf = this.memberWithProduction.production.skillValue.energy?.amountToSelf ?? 0
      const energyAmountToTeam = this.memberWithProduction.production.skillValue.energy?.amountToTeam ?? 0
      const energyAmount = isPaired ? energyAmountToSelf + energyAmountToTeam : 0
      return compactNumber(energyAmount * this.timeWindowFactor)
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
