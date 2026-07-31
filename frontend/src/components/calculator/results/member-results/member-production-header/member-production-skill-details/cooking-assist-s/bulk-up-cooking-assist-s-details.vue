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
          :alt="`Bulk Up (Cooking Assist S) level ${effectiveSkillLevel}`"
          title="Bulk Up (Cooking Assist S)"
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
            >x{{ ingredientValuePerProc }}</span
          >
          <v-img
            src="/images/ingredient/ingredients.png"
            height="20"
            width="20"
            alt="ingredients"
            title="ingredients"
          ></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >+{{ critValuePerProc }}%</span
          >
          <v-img
            src="/images/unit/crit.png"
            height="20"
            width="20"
            alt="meal crit chance"
            title="meal crit chance"
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
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalIngredientValue }} ings</span>
      </div>
      <div class="flex-center">
        <v-img
          src="/images/unit/crit.png"
          height="20"
          width="20"
          alt="meal crit chance"
          title="meal crit chance"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalCritValue }}% crit</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { CookingAssistSBulkUp, MathUtils, compactNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'CookingAssistSBulkUpDetails',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, skillLevelBadgeText, MathUtils, mainskillImage }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    ingredientValuePerProc() {
      return CookingAssistSBulkUp.activations.ingredients.amount({ skillLevel: this.effectiveSkillLevel })
    },
    critValuePerProc() {
      return CookingAssistSBulkUp.activations.critChance.amount({ skillLevel: this.effectiveSkillLevel })
    },
    totalIngredientValue() {
      return compactNumber(
        this.memberWithProduction.production.skillValue.ingredients.amountToSelf * this.timeWindowFactor
      )
    },
    totalCritValue() {
      return compactNumber(
        this.memberWithProduction.production.skillValue['crit chance'].amountToSelf * this.timeWindowFactor
      )
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
