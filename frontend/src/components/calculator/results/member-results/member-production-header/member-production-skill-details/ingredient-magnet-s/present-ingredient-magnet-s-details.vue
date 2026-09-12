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
          :alt="`Present (Ingredient Magnet S) level ${effectiveSkillLevel}`"
          title="Present (Ingredient Magnet S)"
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
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ candyPerProc }}</span
          >
          <v-img src="/images/misc/candy.png" height="20" width="20" alt="candy" title="candy"></v-img>
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
      <div class="flex-center mt-1">
        <v-img src="/images/misc/candy.png" height="20" width="20" alt="candy" title="candy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalCandy }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { IngredientMagnetSPresent, compactNumber, ingredient } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'PresentIngredientMagnetSDetails',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
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
      return this.memberWithProduction.member.pokemon.skill.activations.ingredients.amount({
        skillLevel: this.effectiveSkillLevel
      })
    },
    candyPerProc() {
      return IngredientMagnetSPresent.candyAmount
    },
    totalSkillValue() {
      return compactNumber(this.memberWithProduction.production.skillAmount * this.timeWindowFactor)
    },
    totalCandy() {
      return compactNumber(this.memberWithProduction.production.skillValue.candy?.amountToTeam ?? 0, 2)
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
