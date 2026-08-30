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
          items-per-page="-1"
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
                  :src="pokemonImage({ pokemonName: item.pokemonName, shiny: item.shiny })"
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
                :alt="`${item.berryName?.toLowerCase()} berry`"
                :title="`${item.berryName?.toLowerCase()} berry`"
              ></v-img>
            </div>
            <div class="text-center" style="padding-right: 11px">
              {{ item.berries }}
            </div>
          </template>

          <template #item.ingredients="{ item }">
            <v-row dense style="flex-wrap: nowrap; overflow-x: auto" class="px-4">
              <v-col
                v-for="(ingredient, index) in item.ingredientList"
                :key="index"
                class="flex-start"
                :cols="ingColumnSize"
              >
                <div class="flex-center flex-column">
                  <v-img
                    :src="ingredientImage(ingredient.name)"
                    height="24"
                    width="24"
                    :alt="ingredient.name"
                    :title="ingredient.name"
                    data-testid="ingredient-image"
                  ></v-img>
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
                <v-img
                  :src="`/images/misc/skillproc.png`"
                  height="20"
                  width="20"
                  alt="skill activations"
                  title="skill activations"
                  class="skill-proc-img"
                ></v-img>
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

import { pokemonImage } from '@/services/utils/image-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import type { DataTableHeader } from '@/types/vuetify/table/table-header'
import { MathUtils, ingredient, type IngredientSet } from 'sleepapi-common'

export default defineComponent({
  name: 'CompareOverview',
  setup() {
    const comparisonStore = useComparisonStore()
    const pokemonStore = usePokemonStore()
    return {
      comparisonStore,
      pokemonStore,
      pokemonImage
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
      const factor = this.comparisonStore.timeWindowFactor
      for (const memberProduction of this.comparisonStore.members) {
        const member = this.pokemonStore.getPokemon(memberProduction.externalId)
        if (!member) continue
        const memberPokemon = member.pokemon
        const memberBerry = memberProduction.produceWithoutSkill.berries.at(0)

        production.push({
          member: member.name,
          pokemonName: memberPokemon.name,
          shiny: member.shiny,
          berries: MathUtils.round((memberBerry?.amount ?? 0) * factor, 1),
          berryName: memberBerry?.berry.name ?? member.pokemon.berry.name,
          ingredients: memberProduction.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0) * factor,
          ingredientList: this.splitIngredientMagnetIngredients(memberProduction.produceTotal.ingredients),
          skillProcs: MathUtils.round(memberProduction.skillProcs * factor, 1)
        })
      }

      return production
    },
    ingColumnSize() {
      const maxIngCount = this.members
        .map((item) => item.ingredientList.length)
        .reduce((max, curr) => Math.max(max, curr))
      return Math.floor(12 / maxIngCount)
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
          amount: MathUtils.round((amount - ingMagnetAmount) * this.comparisonStore.timeWindowFactor, 1),
          name: ingredient.name
        }))
      } else {
        return ingredients.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount * this.comparisonStore.timeWindowFactor, 1),
          name: ingredient.name
        }))
      }
    },
    ingredientImage(name: string) {
      return name === 'magnet' ? '/images/ingredient/ingredients.png' : `/images/ingredient/${name.toLowerCase()}.png`
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

.skill-proc-img {
  margin-bottom: 1px;
}
</style>
