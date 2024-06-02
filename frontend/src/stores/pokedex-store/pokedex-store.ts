import type { GroupData } from '@/components/custom-components/group-list.vue'
import { defineStore } from 'pinia'
import { pokemon } from 'sleepapi-common'
import { capitalize } from 'vue'

export interface PokedexState {
  groupedPokedex: GroupData[]
}

export const usePokedexStore = defineStore('pokedex', {
  state: (): PokedexState => {
    const categories = ['ingredient', 'berry', 'skill']
    const completePokedex = [...pokemon.COMPLETE_POKEDEX].sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    const categorizedPokedex: { [key: string]: string[] } = {
      ingredient: [],
      berry: [],
      skill: []
    }

    for (const pkmn of completePokedex) {
      if (categorizedPokedex[pkmn.specialty]) {
        categorizedPokedex[pkmn.specialty].push(capitalize(pkmn.name))
      }
    }

    return {
      groupedPokedex: categories.map((category) => ({
        category,
        list: categorizedPokedex[category]
      }))
    }
  }
})
