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
          :alt="`Ingredient Magnet S level ${effectiveSkillLevel}`"
          title="Ingredient Magnet S"
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
            >x{{ skillValuePerProc }}</span
          >
          <v-img
            src="/images/ingredient/ingredients.png"
            height="20"
            width="20"
            alt="ingredients"
            title="ingredients"
          ></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img
          src="/images/ingredient/ingredients.png"
          height="20"
          width="20"
          alt="ingredients"
          title="ingredients"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalSkillValue }} total</span>
      </div>
      <span class="font-weight-light font-italic text-x-small text-center">
        {{ amountOfEachIngredient }} of each ing</span
      >
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { compactNumber, ingredient } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'IngredientMagnetSDetails',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, skillLevelBadgeText, mainskillImage, compactNumber }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    skillValuePerProc() {
      return this.memberWithProduction.member.pokemon.skill.amount(this.effectiveSkillLevel)
    },
    totalSkillValue() {
      return compactNumber(this.memberWithProduction.production.skillAmount * this.timeWindowFactor)
    },
    amountOfEachIngredient() {
      return compactNumber(
        (this.memberWithProduction.production.skillAmount * this.timeWindowFactor) /
          ingredient.TOTAL_NUMBER_OF_INGREDIENTS,
        2
      )
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
