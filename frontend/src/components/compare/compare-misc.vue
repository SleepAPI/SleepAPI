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

          <template #item.ingredientPercentage="{ item }">
            <div>{{ item.ingredientPercentage }}%</div>
          </template>

          <template #item.skillPercentage="{ item }">
            <div>{{ item.skillPercentage }}%</div>
          </template>

          <template #item.carryLimit="{ item }">
            <div>{{ item.carryLimit }}</div>
          </template>

          <template #item.spilledIngredients="{ item }">
            <v-row dense style="flex-wrap: nowrap; overflow-x: auto">
              <v-col
                v-for="(ingredient, index) in item.spilledIngredientsProduce"
                :key="index"
                class="flex-start"
                cols="4"
              >
                <div class="flex-center flex-column">
                  <v-img
                    :src="ingredientImage(ingredient.ingredient.name.toLowerCase())"
                    height="24"
                    width="24"
                  ></v-img>
                  <div class="text-center">
                    {{ ingredient.amount }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </template>

          <template #item.sneakySnack="{ item }">
            <div class="flex-center" style="padding-right: 11px">
              <v-img
                :src="`/images/berries/${item.sneakySnackProduce?.berry.name?.toLowerCase()}.png`"
                height="24"
                width="24"
              ></v-img>
            </div>
            <div class="text-center" style="padding-right: 11px">
              {{ item.sneakySnack }}
            </div>
          </template>

          <template #item.collectFrequency="{ item }">
            <div v-if="item.collectFrequency">
              <div>
                {{ item.collectFrequency }}
              </div>
            </div>
            <div v-else>Not reached</div>
          </template>

          <template #item.totalHelps="{ item }">
            <div>{{ item.totalHelps }}</div>
          </template>

          <template #item.dayHelps="{ item }">
            <div>{{ item.dayHelps }}</div>
          </template>

          <template #item.nightHelps="{ item }">
            <div>{{ item.nightHelps }}</div>
          </template>

          <template #item.sneakySnackHelps="{ item }">
            <div>{{ item.sneakySnackHelps }}</div>
          </template>

          <template #item.totalRecovery="{ item }">
            <div>{{ item.totalRecovery }}</div>
          </template>

          <template #item.averageEnergy="{ item }">
            <div>{{ item.averageEnergy }}</div>
          </template>

          <template #item.averageFrequency="{ item }">
            <div>{{ item.averageFrequency }}</div>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { TimeUtils } from '@/services/utils/time-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { MathUtils } from 'sleepapi-common'

type DataTableHeader = {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
}

export default defineComponent({
  name: 'CompareMisc',
  setup() {
    const comparisonStore = useComparisonStore()
    return {
      comparisonStore
    }
  },
  data: () => ({
    headers: [
      { title: 'Name', key: 'member', sortable: true, align: 'center' },
      {
        title: 'Ingredient percentage',
        key: 'ingredientPercentage',
        sortable: true,
        align: 'center'
      },
      { title: 'Skill percentage', key: 'skillPercentage', sortable: true, align: 'center' },
      { title: 'Carry limit', key: 'carryLimit', sortable: true, align: 'center' },
      { title: 'Spilled ingredients', key: 'spilledIngredients', sortable: true, align: 'center' },
      { title: 'Sneaky snack', key: 'sneakySnack', sortable: true, align: 'center' },
      {
        title: 'Time to full carry\n(hh:mm:ss)',
        key: 'collectFrequency',
        sortable: true,
        align: 'center'
      },
      {
        title: 'Average frequency\n(hh:mm:ss)',
        key: 'averageFrequency',
        sortable: true,
        align: 'center'
      },
      { title: 'Average energy', key: 'averageEnergy', sortable: true, align: 'center' },
      { title: 'Total recovered energy', key: 'totalRecovery', sortable: true, align: 'center' },
      { title: 'Total helps', key: 'totalHelps', sortable: true, align: 'center' },
      { title: 'Day helps', key: 'dayHelps', sortable: true, align: 'center' },
      { title: 'Night helps', key: 'nightHelps', sortable: true, align: 'center' },
      { title: 'Sneaky snack helps', key: 'sneakySnackHelps', sortable: true, align: 'center' }
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
          ingredientPercentage: MathUtils.round(memberProduction.ingredientPercentage * 100, 1),
          skillPercentage: MathUtils.round(memberProduction.skillPercentage * 100, 1),
          carryLimit: memberProduction.carrySize,
          spilledIngredients: memberProduction.spilledIngredients.reduce(
            (sum, cur) => sum + cur.amount,
            0
          ),
          spilledIngredientsProduce: memberProduction.spilledIngredients.map(
            ({ amount, ingredient }) => ({
              ingredient,
              amount: MathUtils.round(amount, 1)
            })
          ),
          sneakySnack: memberProduction.sneakySnack?.amount ?? 0,
          sneakySnackProduce: memberProduction.sneakySnack,
          totalHelps: memberProduction.nrOfHelps,
          dayHelps: memberProduction.dayHelps,
          nightHelps: memberProduction.nightHelps,
          sneakySnackHelps: memberProduction.sneakySnackHelps,
          totalRecovery: MathUtils.round(memberProduction.totalRecovery, 1),
          averageEnergy: MathUtils.round(memberProduction.averageEnergy, 1),
          averageFrequency: TimeUtils.formatTime(Math.floor(memberProduction.averageFrequency)),
          collectFrequency:
            memberProduction.collectFrequency &&
            TimeUtils.prettifyTime(memberProduction.collectFrequency)
        })
      }

      return production
    }
  },
  methods: {
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
