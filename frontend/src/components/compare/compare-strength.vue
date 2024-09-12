<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-row dense>
    <v-col cols="12">
      <v-card class="d-flex flex-column rounded-t-0">
        <v-data-table key="key" :items="members" :headers="headers" hide-default-footer>
          <template #item.member="{ item }">
            <div class="flex-center">
              <div style="overflow: hidden; width: 60px; height: 60px">
                <v-card
                  width="60px"
                  height="20px"
                  elevation="0"
                  style="transform: translateY(40px); white-space: nowrap"
                  >{{ item.member }}</v-card
                >
                <v-img
                  style="transform: translateY(-20px)"
                  :src="`/images/pokemon/${item.pokemonName.toLowerCase()}${item.shiny ? '_shiny' : ''}.png`"
                  cover
                ></v-img>
              </div>
            </div>
          </template>

          <template #item.berries="{ item }">
            <div class="flex-center">
              <v-img src="/images/misc/strength.png" height="24" width="24"></v-img>
            </div>
            <div class="flex-center text-center">
              {{ item.berries }}
            </div>
          </template>

          <template #item.ingredients="{ item }">
            <div class="flex-center">
              <v-img src="/images/misc/strength.png" height="24" width="24"></v-img>
            </div>
            <div class="flex-center text-center">
              {{ item.lowestIngredientPower }} - {{ item.highestIngredientPower }}
            </div>
          </template>

          <template #item.skillProcs="{ item }">
            <div class="flex-center">
              <div v-if="item.skillUnit !== 'metronome'">
                <div class="flex-center">
                  <v-img
                    :src="`/images/mainskill/${item.skillUnit}.png`"
                    height="24"
                    width="24"
                  ></v-img>
                </div>
                <div v-if="item.energyPerMember">
                  <div>{{ item.energyPerMember }} x5</div>
                </div>
                <div v-else>
                  {{ item.skillValue }}
                </div>
              </div>
            </div>
          </template>

          <template #item.total="{ item }">
            <div class="flex-center">
              <v-img src="/images/misc/strength.png" height="24" width="24"></v-img>
            </div>
            <div class="flex-center text-center">
              {{ item.total }}
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  useComparisonStore
} from '@/stores/comparison-store/comparison-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import {
  MAX_RECIPE_BONUS,
  MAX_RECIPE_LEVEL,
  MathUtils,
  berryPowerForLevel,
  mainskill,
  recipeLevelBonus
} from 'sleepapi-common'

type DataTableHeader = {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
}

export default defineComponent({
  name: 'CompareStrength',
  setup() {
    const comparisonStore = useComparisonStore()
    return {
      comparisonStore
    }
  },
  data: () => ({
    headers: [
      { title: 'Name', key: 'member', sortable: true, align: 'center' },
      { title: 'Berry', key: 'berries', sortable: true, align: 'center' },
      { title: 'Ingredient', key: 'ingredients', sortable: true, align: 'center' },
      { title: 'Skill', key: 'skillProcs', sortable: true, align: 'center' },
      { title: 'Total (max)', key: 'total', sortable: true, align: 'center' }
    ] as DataTableHeader[]
  }),
  computed: {
    members() {
      const production = []
      for (const memberProduction of this.comparisonStore.members) {
        const memberPokemon = memberProduction.member.pokemon

        const berryPower = this.berryPower(memberProduction)
        const ingredientPower = this.highestIngredientPower(memberProduction)
        const skillValue = this.skillValue(memberProduction)

        const total = Math.floor(
          berryPower + ingredientPower + (memberPokemon.skill.unit === 'strength' ? skillValue : 0)
        )

        production.push({
          member: memberProduction.member.name,
          pokemonName: memberPokemon.name,
          shiny: memberProduction.member.shiny,
          berries: berryPower,
          berryName: memberProduction.berries?.berry.name,
          ingredients:
            memberProduction.ingredients.reduce((sum, cur) => sum + cur.amount, 0) /
            this.comparisonStore.timewindowDivider,
          lowestIngredientPower: this.lowestIngredientPower(memberProduction),
          highestIngredientPower: ingredientPower,
          skillUnit: memberPokemon.skill.unit,
          skillValue,
          energyPerMember: this.energyPerMember(memberProduction),
          total
        })
      }

      return production
    }
  },
  methods: {
    energyPerMember(memberProduction: MemberProductionExt) {
      const skill = memberProduction.member.pokemon.skill
      if (
        skill.name === mainskill.ENERGY_FOR_EVERYONE.name ||
        skill.name === mainskill.ENERGIZING_CHEER_S.name
      ) {
        return MathUtils.round(this.skillValue(memberProduction) / 5, 1)
      }
    },
    skillValue(memberProduction: MemberProductionExt) {
      // TODO: different rounding for different skills
      const amount =
        memberProduction.member.pokemon.skill.amount[memberProduction.member.skillLevel - 1] *
        (memberProduction.member.pokemon.skill.name === mainskill.ENERGY_FOR_EVERYONE.name ? 5 : 1)

      return MathUtils.round(
        (amount * memberProduction.skillProcs) / this.comparisonStore.timewindowDivider,
        1
      )
    },
    berryPower(memberProduction: MemberProductionExt) {
      const favoredBerryMultiplier = this.comparisonStore.favoredBerries.some(
        (berry) => berry.name === memberProduction.member.pokemon.berry.name
      )
        ? 2
        : 1
      return Math.floor(
        ((memberProduction.berries?.amount ?? 0) / this.comparisonStore.timewindowDivider) *
          berryPowerForLevel(memberProduction.member.pokemon.berry, memberProduction.member.level) *
          favoredBerryMultiplier
      )
    },
    lowestIngredientPower(memberProduction: MemberProductionExt) {
      return Math.floor(
        memberProduction.ingredients.reduce(
          (sum, cur) => sum + cur.amount * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER,
          0
        ) / this.comparisonStore.timewindowDivider
      )
    },
    highestIngredientPower(memberProduction: MemberProductionExt) {
      const recipeBonus = 1 + MAX_RECIPE_BONUS / 100
      const maxLevelRecipeMultiplier = recipeLevelBonus[MAX_RECIPE_LEVEL]

      return Math.floor(
        (recipeBonus *
          maxLevelRecipeMultiplier *
          memberProduction.ingredients.reduce(
            (sum, cur) => sum + cur.amount * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER,
            0
          )) /
          this.comparisonStore.timewindowDivider
      )
    }
  }
})
</script>

<style lang="scss">
.v-table > .v-table__wrapper > table > tbody > tr > td,
.v-table > .v-table__wrapper > table > tbody > tr > th,
.v-table > .v-table__wrapper > table > thead > tr > td,
.v-table > .v-table__wrapper > table > thead > tr > th {
  padding: 0 0px !important;
  padding-left: 0px !important;
}

.v-table > .v-table__wrapper > table > tbody > tr > td:not(:last-child),
.v-table > .v-table__wrapper > table > tbody > tr > th:not(:last-child) {
  border-right: 1px solid #dddddd87;
}
</style>
