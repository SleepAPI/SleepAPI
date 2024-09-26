<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-row dense>
    <v-col cols="12">
      <v-card class="d-flex flex-column rounded-t-0 frosted-glass">
        <v-data-table
          key="key"
          :items="members"
          :headers="headers"
          hide-default-footer
          class="bg-transparent"
        >
          <template #item.member="{ item }">
            <div class="flex-center">
              <div style="overflow: hidden; width: 100px; height: 60px">
                <v-card
                  height="20px"
                  elevation="0"
                  class="bg-transparent"
                  style="transform: translateY(40px); white-space: nowrap"
                  >{{ item.member }}</v-card
                >
                <v-img
                  height="60px"
                  width="60px"
                  style="transform: translate(20px, -25px)"
                  :src="`/images/pokemon/${item.pokemonName.toLowerCase()}${item.shiny ? '_shiny' : ''}.png`"
                  cover
                ></v-img>
              </div>
            </div>
          </template>

          <template #item.berries="{ item }">
            <div class="flex-center" style="padding-right: 11px">
              <v-img
                :src="`/images/berries/${item.berryName?.toLowerCase()}.png`"
                height="24"
                width="24"
              ></v-img>
            </div>
            <div class="text-center" style="padding-right: 11px">
              {{ item.berries }}
            </div>
          </template>

          <template #item.ingredients="{ item }">
            <v-row dense style="flex-wrap: nowrap; overflow-x: auto">
              <v-col
                v-for="(ingredient, index) in item.ingredientList"
                :key="index"
                class="flex-start"
                cols="4"
              >
                <div class="flex-center flex-column">
                  <v-img :src="ingredientImage(ingredient.name)" height="24" width="24"></v-img>
                  <div class="text-center">
                    {{ ingredient.amount }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </template>

          <template #item.skillProcs="{ item }">
            <div class="flex-center">
              <div>
                <v-img :src="`/images/misc/skillproc.png`" height="24" width="24"></v-img>
                {{ item.skillProcs }}
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { MathUtils, ingredient, type IngredientSet } from 'sleepapi-common'

type DataTableHeader = {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
}

export default defineComponent({
  name: 'CompareOverview',
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
      { title: 'Skill', key: 'skillProcs', sortable: true, align: 'center' }
    ] as DataTableHeader[]
  }),
  computed: {
    members() {
      const production = []
      for (const memberProduction of this.comparisonStore.members) {
        const memberPokemon = memberProduction.member.pokemon

        production.push({
          member: memberProduction.member.name,
          pokemonName: memberPokemon.name,
          shiny: memberProduction.member.shiny,
          berries: MathUtils.round(
            (memberProduction.berries?.amount ?? 0) / this.comparisonStore.timewindowDivider,
            1
          ),
          berryName: memberProduction.berries?.berry.name,
          ingredients:
            memberProduction.ingredients.reduce((sum, cur) => sum + cur.amount, 0) /
            this.comparisonStore.timewindowDivider,
          ingredientList: this.splitIngredientMagnetIngredients(memberProduction.ingredients),
          skillProcs: MathUtils.round(
            memberProduction.skillProcs / this.comparisonStore.timewindowDivider,
            1
          ),
          skillUnit: memberPokemon.skill.unit
        })
      }

      return production
    }
  },
  methods: {
    splitIngredientMagnetIngredients(ingredients: IngredientSet[]) {
      if (ingredients.length >= ingredient.INGREDIENTS.length) {
        const ingMagnetAmount = ingredients.reduce(
          (min, cur) => (cur.amount < min ? cur.amount : min),
          ingredients[0].amount
        )

        const nonIngMagnetIngs = ingredients.filter((ing) => ing.amount !== ingMagnetAmount)

        return nonIngMagnetIngs.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(
            (amount - ingMagnetAmount) / this.comparisonStore.timewindowDivider,
            1
          ),
          name: ingredient.name.toLowerCase()
        }))
      } else {
        return ingredients.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount / this.comparisonStore.timewindowDivider, 1),
          name: ingredient.name.toLowerCase()
        }))
      }
    },
    ingredientImage(name: string) {
      return name === 'magnet' ? '/images/misc/ingredients.png' : `/images/ingredient/${name}.png`
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
