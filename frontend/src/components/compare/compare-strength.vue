<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card class="flex-center flex-column frosted-glass rounded-t-0 w-100">
    <v-container>
      <v-row class="flex-left">
        <v-col cols="12">
          <v-chip-group v-model="chips" column multiple>
            <v-chip text="Berry strength" color="berry" variant="outlined" filter></v-chip>
            <v-chip text="Skill strength" color="skill" variant="outlined" filter></v-chip>
          </v-chip-group>

          <v-menu v-model="ingredientMenu" location="bottom start">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                variant="outlined"
                :color="selectedIngredientOption !== 'ignore' ? 'ingredient' : ''"
                :text="ingredientChipText()"
                :class="{ 'selected-chip': selectedIngredientOption !== 'ignore' }"
                append-icon="mdi-menu-down"
              >
                <template v-if="selectedIngredientOption !== 'ignore'" #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
              </v-chip>
            </template>

            <v-card color="surface">
              <v-radio-group v-model="selectedIngredientOption" column hide-details>
                <v-list-item
                  v-for="option in options"
                  :key="option.value"
                  class="px-2"
                  @click="setIngredientOptions(option.value)"
                >
                  <v-radio :label="option.label" :value="option.value" hide-details></v-radio>
                </v-list-item>
              </v-radio-group>
            </v-card>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>

    <v-row class="w-100 py-2">
      <v-container class="w-100 flex-center" style="max-width: 400px">
        <v-btn-toggle
          v-model="tab"
          mandatory
          rounded="pill"
          variant="outlined"
          class="w-75"
          style="height: 40px"
        >
          <v-btn
            value="visual"
            class="w-50"
            :prepend-icon="tab === 'visual' ? 'mdi-check' : ''"
            style="min-height: 36px; font-size: 14px; padding: 8px 16px"
          >
            Visual
          </v-btn>
          <v-btn
            value="data"
            class="w-50"
            :prepend-icon="tab === 'data' ? 'mdi-check' : ''"
            style="min-height: 36px; font-size: 14px; padding: 8px 16px"
          >
            Data
          </v-btn>
        </v-btn-toggle>
      </v-container>
    </v-row>

    <v-tabs-window v-model="tab" class="w-100">
      <v-tabs-window-item value="visual">
        <v-row v-for="(member, index) in members" :key="index" dense class="w-100">
          <v-col cols="auto" class="flex-center">
            <div class="flex-center">
              <div class="text-center" style="overflow: hidden; width: 60px; height: 60px">
                <v-card
                  color="transparent"
                  height="20px"
                  elevation="0"
                  style="transform: translateY(40px); white-space: nowrap"
                  >{{ member.member }}</v-card
                >
                <v-img
                  height="60px"
                  width="60px"
                  style="transform: translate(0px, -25px)"
                  :src="`/images/pokemon/${member.pokemonName.toLowerCase()}${member.shiny ? '_shiny' : ''}.png`"
                  cover
                ></v-img>
              </div>
            </div>
          </v-col>
          <v-col class="flex-center">
            <StackedBar
              style="height: 25px"
              :sections="[
                {
                  color: 'berry',
                  percentage: member.berryPercentage,
                  text: member.berryCompact
                },
                {
                  color: 'skill',
                  percentage: member.skillPercentage,
                  text: member.skillCompact
                },
                {
                  color: 'ingredient',
                  percentage: member.ingredientPercentage,
                  text: member.ingredientCompact
                }
              ]"
            />
          </v-col>
          <v-col cols="auto" class="flex-center">
            {{ member.totalCompact }}
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item value="data">
        <v-data-table
          key="key"
          :items="members"
          :headers="headers"
          hide-default-footer
          class="bg-transparent"
          style="border-radius: 10px"
        >
          <template #item.member="{ item }">
            <div class="flex-center">
              <div style="overflow: hidden; width: 60px; height: 60px">
                <v-card
                  width="60px"
                  height="20px"
                  elevation="0"
                  class="bg-transparent"
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
              {{ item.ingredientPower }}
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
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import StackedBar from '@/components/custom-components/stacked-bar.vue'
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
  compactNumber,
  defaultZero,
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
  components: { StackedBar },
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
      { title: 'Total', key: 'total', sortable: true, align: 'center' }
    ] as DataTableHeader[],
    chips: [0, 1],
    tab: 'visual',
    tabs: [
      { value: 'visual', label: 'Visual' },
      { value: 'data', label: 'Data' }
    ],
    selectedIngredientOption: 'max',
    ingredientMenu: false,
    options: [
      { label: 'Ignore ingredients', value: 'ignore' },
      { label: 'Min ingredient strength', value: 'min' },
      { label: 'Max ingredient strength', value: 'max' }
    ]
  }),
  computed: {
    showBerries() {
      return this.chips.includes(0)
    },
    showSkills() {
      return this.chips.includes(1)
    },
    showIngredientMin() {
      return this.selectedIngredientOption === 'min'
    },
    showIngredientMax() {
      return this.selectedIngredientOption === 'max'
    },
    members() {
      const production = []
      for (const memberProduction of this.comparisonStore.members) {
        const memberPokemon = memberProduction.member.pokemon
        const berryPower = this.showBerries ? this.berryPower(memberProduction) : 0
        const ingredientPower = this.showIngredientMax
          ? this.highestIngredientPower(memberProduction)
          : this.showIngredientMin
            ? this.lowestIngredientPower(memberProduction)
            : 0
        const skillValue = this.showSkills ? this.skillValue(memberProduction) : 0
        const total = Math.floor(
          berryPower + ingredientPower + (memberPokemon.skill.unit === 'strength' ? skillValue : 0)
        )
        production.push({
          member: memberProduction.member.name,
          pokemonName: memberPokemon.name,
          shiny: memberProduction.member.shiny,
          berries: berryPower,
          berryCompact: compactNumber(berryPower),
          berryName: memberProduction.berries?.berry.name,
          ingredients:
            memberProduction.ingredients.reduce((sum, cur) => sum + cur.amount, 0) /
            this.comparisonStore.timewindowDivider,
          ingredientPower,
          ingredientCompact: compactNumber(ingredientPower),
          skillUnit: memberPokemon.skill.unit,
          skillValue,
          skillCompact: memberPokemon.skill.unit === 'strength' ? compactNumber(skillValue) : '',
          energyPerMember: this.energyPerMember(memberProduction),
          total,
          totalCompact: compactNumber(total)
        })
      }

      const sortedProduction = production.sort((a, b) => b.total - a.total)
      const highestTotal = sortedProduction.at(0)?.total ?? 0

      const result = []
      for (const member of sortedProduction) {
        const berryPercentage = defaultZero((member.berries / highestTotal) * 100)
        const skillPercentage = defaultZero(
          ((member.skillUnit === 'strength' ? member.skillValue : 0) / highestTotal) * 100
        )
        const ingredientPercentage = defaultZero((member.ingredientPower / highestTotal) * 100)
        const comparedToBest = defaultZero((1 - member.total / highestTotal) * 100)

        result.push({
          ...member,
          berryPercentage,
          skillPercentage,
          ingredientPercentage,
          comparedToBest
        })
      }
      return result
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
    },
    setIngredientOptions(option: string) {
      this.selectedIngredientOption = option
    },
    ingredientChipText() {
      switch (this.selectedIngredientOption) {
        case 'min':
          return 'Min ingredient strength'
        case 'max':
          return 'Max ingredient strength'
        default:
          return 'Ingredient strength'
      }
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';

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

.selected-chip {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: 'ingredient';
}
</style>
