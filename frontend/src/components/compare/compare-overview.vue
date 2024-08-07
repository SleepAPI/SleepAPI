<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-row dense>
    <v-col cols="12">
      <v-card class="d-flex flex-column rounded-t-0">
        <v-data-table key="key" :items="members" :headers="headers" hide-default-footer>
          <template #item.member="{ item }">
            <div>
              <div class="flex-center" style="max-height: 40px; overflow: hidden">
                <v-img
                  :src="`/images/pokemon/${item.pokemonName.toLowerCase()}.png`"
                  height="64"
                  cover
                ></v-img>
              </div>
              <div class="text-center">
                {{ item.member }}
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
            <div class="flex-center flex-column">
              <div>
                <v-img :src="`/images/misc/skillproc.png`" height="24" width="24"></v-img>
              </div>
              <div class="text-center">
                {{ item.skillProcs }}
              </div>
            </div>
            <div class="flex-center flex-column">
              <div>
                <v-img :src="`/images/mainskill/strength.png`" height="24" width="24"></v-img>
              </div>
              <div class="text-center">27638</div>
            </div>
            <!-- <v-row dense>
              <v-col cols="6">
                <div class="flex-center flex-column">
                  <div>
                    <v-img :src="`/images/misc/skillproc.png`" height="24" width="24"></v-img>
                  </div>
                  <div class="text-center">
                    {{ item.skillProcs }}
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="flex-center flex-column">
                  <div>
                    <v-img :src="`/images/mainskill/strength.png`" height="24" width="24"></v-img>
                  </div>
                  <div class="text-center">27638</div>
                </div>
              </v-col>
            </v-row> -->
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils, ingredient, type IngredientSet } from 'sleepapi-common'

type DataTableHeader = {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
}

// TODO: tomorrow:
// fix skill value under procs
// fix so unsave from compare doesnt delete from db
// test
// go live

export default defineComponent({
  name: 'TeamResults',
  props: {
    membersToCompare: {
      type: Array<MemberProductionExt>,
      required: true
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
      for (const memberProduction of this.membersToCompare) {
        production.push({
          member: memberProduction.member.name,
          pokemonName: memberProduction.member.pokemon.name,
          berries: MathUtils.round(memberProduction.berries?.amount ?? 0, 1),
          berryName: memberProduction.berries?.berry.name,
          ingredients: memberProduction.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
          ingredientList: this.splitIngredientMagnetIngredients(memberProduction.ingredients),
          skillProcs: MathUtils.round(memberProduction.skillProcs, 1)
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

        const result = nonIngMagnetIngs.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount - ingMagnetAmount, 1),
          name: ingredient.name.toLowerCase()
        }))

        // TODO: move these to skill value
        // result.push({
        //   amount: MathUtils.round(ingMagnetAmount, 2),
        //   name: 'magnet'
        // })

        return result
      } else {
        return ingredients.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount, 1),
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
.v-table > .v-table__wrapper > table > thead > tr > th,
.v-table > .v-table__wrapper > table > tfoot > tr > td,
.v-table > .v-table__wrapper > table > tfoot > tr > th {
  padding: 0 0px !important;
  padding-left: 0px !important;
}
</style>
