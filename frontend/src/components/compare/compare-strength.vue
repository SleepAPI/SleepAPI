<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card class="flex-center flex-column frosted-glass rounded-t-0 w-100">
    <v-container>
      <v-row class="d-flex align-center justify-space-between">
        <v-col class="d-flex align-center flex-wrap">
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

        <v-col cols="auto" class="flex-right">
          <v-btn-toggle v-model="tab" mandatory rounded="pill" variant="outlined" style="height: 32px">
            <v-btn value="visual" class="w-50" :prepend-icon="tab === 'visual' ? 'mdi-check' : ''"> Visual </v-btn>
            <v-btn value="data" class="w-50" :prepend-icon="tab === 'data' ? 'mdi-check' : ''"> Data </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-container>

    <v-tabs-window v-model="tab" class="w-100">
      <v-tabs-window-item value="visual" class="pb-4">
        <v-row v-for="(member, index) in members" :key="index" no-gutters class="w-100">
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
                  :src="pokemonImage({ pokemonName: member.pokemon.name, shiny: member.shiny })"
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
                  sectionText: member.berryCompact,
                  tooltipText: `${member.berryCompact} (${round(member.berryPercentage)}%)`
                },
                {
                  color: 'skill',
                  percentage: member.skillPercentage,
                  sectionText: member.skillCompact,
                  tooltipText: `${member.skillCompact} (${round(member.skillPercentage)}%)`
                },
                {
                  color: 'ingredient',
                  percentage: member.ingredientPercentage,
                  sectionText: member.ingredientCompact,
                  tooltipText: `${member.ingredientCompact} (${round(member.ingredientPercentage)}%)`
                }
              ]"
            />
          </v-col>
          <v-col cols="auto" class="flex-center" style="min-width: 55px">
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
          items-per-page="-1"
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
                  :src="pokemonImage({ pokemonName: item.pokemon.name, shiny: item.shiny })"
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
              <div v-if="!item.skill.is(Metronome, SkillCopy)">
                <div class="flex-center">
                  <v-img :src="mainskillImage(item.pokemon)" height="24" width="24"></v-img>
                </div>
                <div v-if="item.energyPerMember">
                  <div>{{ item.energyPerMember }}</div>
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
import { mainskillImage, pokemonImage } from '@/services/utils/image-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import type { DataTableHeader } from '@/types/vuetify/table/table-header'
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  EnergyForEveryoneS,
  MAX_RECIPE_LEVEL,
  MathUtils,
  Metronome,
  SkillCopy,
  compactNumber,
  defaultZero,
  getMaxIngredientBonus,
  getPokemon,
  recipeLevelBonus,
  type MemberProduction
} from 'sleepapi-common'

export default defineComponent({
  name: 'CompareStrength',
  components: { StackedBar },
  setup() {
    const comparisonStore = useComparisonStore()
    const userStore = useUserStore()
    const pokemonStore = usePokemonStore()
    return {
      comparisonStore,
      userStore,
      pokemonStore,
      mainskillImage,
      pokemonImage,
      Metronome,
      SkillCopy
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
    selectedIngredientOption: 'min',
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
      const timeWindowFactor = this.comparisonStore.timeWindowFactor

      for (const memberProduction of this.comparisonStore.members) {
        const member = this.pokemonStore.getPokemon(memberProduction.externalId)
        if (!member) continue
        const memberPokemon = member.pokemon

        const berryPower = this.showBerries ? Math.floor(memberProduction.strength.berries.total * timeWindowFactor) : 0

        const ingredientPower = this.showIngredientMax
          ? this.highestIngredientPower(memberProduction)
          : this.showIngredientMin
            ? this.lowestIngredientPower(memberProduction)
            : 0

        const skillStrength = this.showSkills ? Math.floor(memberProduction.strength.skill.total * timeWindowFactor) : 0

        // TODO: this feels hacky, we're just summing all skill values, even with completely unrelated units. Doesn't make sense. But we're reworking how compare tool is working anyway, this has always worked suboptimally.
        let skillValue = 0
        for (const activation of memberPokemon.skill.getUnits()) {
          skillValue += this.showSkills
            ? defaultZero(memberProduction.skillValue[activation]?.amountToSelf) +
              defaultZero(memberProduction.skillValue[activation]?.amountToTeam)
            : 0
        }
        skillValue = MathUtils.round(skillValue * timeWindowFactor, 1)

        const total = Math.floor(berryPower + ingredientPower + skillStrength)

        production.push({
          member: member.name,
          pokemon: memberPokemon,
          shiny: member.shiny,
          berries: berryPower,
          berryCompact: compactNumber(berryPower),
          ingredients:
            memberProduction.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0) * timeWindowFactor,
          ingredientPower,
          ingredientCompact: compactNumber(ingredientPower),
          skill: memberPokemon.skill,
          skillStrength,
          skillValue,
          skillCompact: skillStrength > 0 ? compactNumber(skillStrength) : '',
          energyPerMember: memberPokemon.skill.hasUnit('energy') ? this.energyPerMember(memberProduction) : 0,
          total,
          totalCompact: compactNumber(total)
        })
      }

      const sortedProduction = production.sort((a, b) => b.total - a.total)
      const highestTotal = sortedProduction.at(0)?.total ?? 0

      const result = []
      for (const member of sortedProduction) {
        const berryPercentage = defaultZero((member.berries / highestTotal) * 100)
        const skillPercentage = defaultZero((member.skillStrength / highestTotal) * 100)
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
    energyPerMember(member: MemberProduction): string | undefined {
      const pokemon = getPokemon(member.pokemonWithIngredients.pokemon)
      const skill = pokemon.skill
      const critAmount = member.advanced.skillCritValue
      const amountWithoutCrit =
        (member.skillValue['energy']?.amountToSelf ?? 0) + (member.skillValue['energy']?.amountToTeam ?? 0) - critAmount

      const e4eSuffix = skill.isOrModifies(EnergyForEveryoneS) ? 'x5' : ''
      return `${MathUtils.round(amountWithoutCrit, 1)} ${e4eSuffix}${critAmount > 0 ? `+${MathUtils.round(critAmount, 1)}` : ''}`
    },
    lowestIngredientPower(memberProduction: MemberProduction) {
      const islandBonus = this.userStore.islandBonus(
        this.comparisonStore.currentTeam ? this.comparisonStore.currentTeam.island.shortName : undefined
      )
      const amount = memberProduction.produceTotal.ingredients.reduce(
        (sum, cur) => sum + cur.amount * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER * islandBonus,
        0
      )
      return Math.floor(amount * this.comparisonStore.timeWindowFactor)
    },
    highestIngredientPower(memberProduction: MemberProduction) {
      const maxLevelRecipeMultiplier = recipeLevelBonus[MAX_RECIPE_LEVEL]
      const islandBonus = this.userStore.islandBonus(
        this.comparisonStore.currentTeam ? this.comparisonStore.currentTeam.island.shortName : undefined
      )
      const amount =
        maxLevelRecipeMultiplier *
        islandBonus *
        memberProduction.produceTotal.ingredients.reduce((sum, cur) => {
          const ingredientBonus = 1 + getMaxIngredientBonus(cur.ingredient.name) / 100
          return sum + cur.amount * ingredientBonus * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER
        }, 0)
      return Math.floor(amount * this.comparisonStore.timeWindowFactor)
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
    },
    round(num: number) {
      return MathUtils.round(num, 1)
    }
  }
})
</script>

<style lang="scss" scoped>
:deep(.v-table > .v-table__wrapper > table > tbody > tr > td),
:deep(.v-table > .v-table__wrapper > table > tbody > tr > th),
:deep(.v-table > .v-table__wrapper > table > thead > tr > td),
:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  padding: 0 0px !important;
  padding-left: 0px !important;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td:not(:last-child)),
:deep(.v-table > .v-table__wrapper > table > tbody > tr > th:not(:last-child)) {
  border-right: 1px solid #dddddd87;
}

.selected-chip {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: 'ingredient';
}
</style>
