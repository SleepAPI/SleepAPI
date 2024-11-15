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
                  :src="pokemonImage({ pokemonName: item.pokemonName, shiny: item.shiny })"
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
                v-for="(ingredientSet, index) in item.spilledIngredientsProduce"
                :key="index"
                class="flex-start"
                cols="4"
              >
                <div class="flex-center flex-column">
                  <v-img
                    :src="ingredientImage(ingredientSet.ingredient.name.toLowerCase())"
                    height="24"
                    width="24"
                  ></v-img>
                  <div class="text-center">
                    {{ ingredientSet.amount }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </template>

          <template #item.sneakySnack="{ item }">
            <div class="flex-center" style="padding-right: 11px">
              <v-img
                :src="berryImage(item.sneakySnackProduce.berry)"
                height="24"
                width="24"
              ></v-img>
            </div>
            <div class="text-center" style="padding-right: 11px">
              {{ item.sneakySnack }}
            </div>
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
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { berryImage, pokemonImage } from '@/services/utils/image-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
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
    const pokemonStore = usePokemonStore()
    return {
      comparisonStore,
      pokemonStore,
      pokemonImage,
      berryImage
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
        const member = this.pokemonStore.getPokemon(memberProduction.externalId)
        if (!member) continue
        const memberPokemon = member.pokemon

        production.push({
          member: member.name,
          pokemonName: memberPokemon.name,
          shiny: member.shiny,
          ingredientPercentage: MathUtils.round(
            memberProduction.advanced.ingredientPercentage * 100,
            1
          ),
          skillPercentage: MathUtils.round(memberProduction.advanced.skillPercentage * 100, 1),
          carryLimit: memberProduction.advanced.carrySize,
          spilledIngredients: memberProduction.advanced.spilledIngredients.reduce(
            (sum, cur) => sum + cur.amount,
            0
          ),
          spilledIngredientsProduce: memberProduction.advanced.spilledIngredients.map(
            ({ amount, ingredient }) => ({
              ingredient,
              amount: MathUtils.round(amount, 1)
            })
          ),
          sneakySnack: MathUtils.round(memberProduction.advanced.sneakySnack.amount, 1),
          sneakySnackProduce: memberProduction.advanced.sneakySnack,
          totalHelps: MathUtils.round(memberProduction.advanced.totalHelps, 1),
          dayHelps: MathUtils.round(memberProduction.advanced.dayHelps, 1),
          nightHelps: MathUtils.round(memberProduction.advanced.nightHelps, 1),
          sneakySnackHelps: MathUtils.round(memberProduction.advanced.nightHelpsAfterSS, 1),
          totalRecovery: MathUtils.round(memberProduction.advanced.totalRecovery, 1)
        })
      }

      return production
    }
  },
  methods: {
    ingredientImage(name: string) {
      return name === 'magnet'
        ? '/images/ingredient/ingredients.png'
        : `/images/ingredient/${name}.png`
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
