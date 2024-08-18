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
            <div class="flex-center">
              <div>
                <v-img :src="`/images/misc/skillproc.png`" height="24" width="24"></v-img>
                {{ item.skillProcs }}
              </div>
              <div v-if="item.skillUnit !== 'metronome'" class="pl-2 pr-2">
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
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils, ingredient, mainskill, type IngredientSet } from 'sleepapi-common'

type DataTableHeader = {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
}

export default defineComponent({
  name: 'TeamResults',
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
          berries: MathUtils.round(memberProduction.berries?.amount ?? 0, 1),
          berryName: memberProduction.berries?.berry.name,
          ingredients: memberProduction.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
          ingredientList: this.splitIngredientMagnetIngredients(memberProduction.ingredients),
          skillProcs: MathUtils.round(memberProduction.skillProcs, 1),
          skillUnit: memberPokemon.skill.unit,
          skillValue: this.skillValue(memberProduction),
          energyPerMember: this.energyPerMember(memberProduction)
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

      return MathUtils.round(amount * memberProduction.skillProcs, 1)
    },
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
.v-table > .v-table__wrapper > table > thead > tr > th {
  padding: 0 0px !important;
  padding-left: 0px !important;
}

.v-table > .v-table__wrapper > table > tbody > tr > td:not(:last-child),
.v-table > .v-table__wrapper > table > tbody > tr > th:not(:last-child) {
  border-right: 1px solid #dddddd87;
}
</style>
