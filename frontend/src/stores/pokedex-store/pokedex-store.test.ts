import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { createPinia, setActivePinia } from 'pinia'
import { pokemon } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import { capitalize } from 'vue'

describe('Pokedex Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have the expected default state', () => {
    const pokedexStore = usePokedexStore()

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

    const expectedGroupedPokedex = categories.map((category) => ({
      category,
      list: categorizedPokedex[category]
    }))

    expect(pokedexStore.$state.groupedPokedex).toEqual(expectedGroupedPokedex)
  })

  it('should sort Pokémon names alphabetically within each category', () => {
    const pokedexStore = usePokedexStore()

    for (const group of pokedexStore.groupedPokedex) {
      const sortedList = [...group.list].sort((a, b) => a.localeCompare(b))
      expect(group.list).toEqual(sortedList)
    }
  })
})
