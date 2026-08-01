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
          :alt="`Ingredient Draw S level ${effectiveSkillLevel}`"
          title="Ingredient Draw S"
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
            >x{{ skillValuePerNormalProc }}</span
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

    <v-col cols="auto" class="flex-center flex-column mt-1">
      <!-- Main ingredient output -->
      <div class="flex-center ga-2">
        <div v-for="(ing, index) in preparedIngredients" :key="index" class="flex-column flex-center">
          <v-img
            :src="ing.image"
            :alt="ing.ingredient.name"
            :title="ing.ingredient.name"
            height="24"
            width="24"
          ></v-img>
          <span class="font-weight-light font-italic text-x-small text-center">{{ ing.amount }}</span>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { ingredientImage, mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'IngredientDrawSDetails',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
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
    skill() {
      // All base versions of Ingredient Draw use this component.
      return this.memberWithProduction.member.pokemon.skill
    },
    skillValuePerNormalProc() {
      return this.skill.activations.ingredients.amount({ skillLevel: this.effectiveSkillLevel })
    },
    preparedIngredients() {
      return this.memberWithProduction.production.produceFromSkill.ingredients.map((ing) => ({
        amount: MathUtils.round(ing.amount * this.timeWindowFactor, 1),
        ingredient: ing.ingredient,
        image: ingredientImage(ing.ingredient.name)
      }))
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
