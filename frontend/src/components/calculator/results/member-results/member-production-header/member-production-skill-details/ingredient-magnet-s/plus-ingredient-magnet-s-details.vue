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
          :alt="`Plus (Ingredient Magnet S) level ${effectiveSkillLevel}`"
          title="Plus (Ingredient Magnet S)"
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
            >x{{ combinedIngCountPerProc }}</span
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
      <!-- Magnet ingredient output -->
      <div class="flex-center">
        <v-img
          src="/images/ingredient/ingredients.png"
          height="20"
          width="20"
          alt="ingredients"
          title="ingredients"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ magnetIngCountTotal }} random</span>
      </div>
      <span class="font-weight-light font-italic text-x-small text-center">
        {{ amountOfEachIngredient }} of each ing</span
      >
      <!-- A-slot ingredient output -->
      <div class="flex-center">
        <v-img
          :src="aIng.image"
          :alt="aIng.ingredient.name"
          :title="aIng.ingredient.name"
          height="20"
          width="20"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2">{{ aIngCountTotal }} bonus</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { ingredientImage, mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { MathUtils, compactNumber, ingredient, isPlusOrMinus } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'IngredientMagnetSPlusDetails',
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
    skill() {
      // Both versions of Plus use this component.
      return this.memberWithProduction.member.pokemon.skill
    },
    aIng() {
      const ing = this.memberWithProduction.member.ingredients[0].ingredient
      return {
        ingredient: ing,
        image: ingredientImage(ing.name)
      }
    },
    combinedIngCountPerProc() {
      const magnetIngs = this.skill.activations.solo.amount({ skillLevel: this.effectiveSkillLevel })
      const aSlotIngs = this.skill.activations.paired.amount({
        skillLevel: this.effectiveSkillLevel,
        ingredient: this.memberWithProduction.member.pokemon.ingredient0.at(0)?.ingredient
      })
      const teamMembers = this.teamStore.getCurrentTeam.members
        .filter(Boolean)
        .map((member) => this.pokemonStore.getPokemon(member!)!.pokemon)
      const isPaired = teamMembers.filter((member) => isPlusOrMinus(member.skill)).length > 1
      return isPaired ? aSlotIngs + magnetIngs : magnetIngs
    },
    averageMagnetAmount() {
      const amountsIgnoringA = this.memberWithProduction.production.produceFromSkill.ingredients
        .filter((ing) => ing.ingredient.name !== this.memberWithProduction.member.ingredients[0].ingredient.name)
        .map((ingSet) => ingSet.amount)
      const totalIgnoringA = amountsIgnoringA.reduce((sum, amount) => sum + amount, 0)
      const averageAmount = totalIgnoringA / amountsIgnoringA.length
      return averageAmount
    },
    magnetIngCountTotal() {
      const amount = this.averageMagnetAmount * ingredient.TOTAL_NUMBER_OF_INGREDIENTS
      return compactNumber(amount * this.timeWindowFactor)
    },
    aIngCountTotal() {
      const amountIncludingMagnet =
        this.memberWithProduction.production.produceFromSkill.ingredients.find(
          (ing) => ing.ingredient.name === this.memberWithProduction.member.ingredients[0].ingredient.name
        )?.amount ?? 0
      const amount = Math.max(amountIncludingMagnet - this.averageMagnetAmount, 0)
      return compactNumber(amount * this.timeWindowFactor)
    },
    amountOfEachIngredient() {
      return compactNumber(this.averageMagnetAmount * this.timeWindowFactor)
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
