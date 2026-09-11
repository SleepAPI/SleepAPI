import BfsIndexPage from '@/pages/bfs-index/bfs-index-page.vue'
import { buildBfsIndexRows, formatBfsIndex } from '@/services/bfs-index-service'
import { COMPLETE_POKEDEX } from 'sleepapi-common'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('Berry Finding S Index page', () => {
  it('filters while typing, retains score order, and restores the chart when cleared', async () => {
    const wrapper = mount(BfsIndexPage)
    const search = wrapper.get('[data-testid="pokemon-search"] input')
    const originalRows = wrapper.findAll('tbody tr').length
    const entries = buildBfsIndexRows().flatMap((row) => row.entries)

    for (const query of ['g', 'ga', '  GAr  ']) {
      await search.setValue(query)
      const matches = entries.filter((entry) =>
        entry.pokemon.displayName.toLowerCase().includes(query.trim().toLowerCase())
      )
      expect(wrapper.findAll('tbody img').map((img) => img.attributes('alt'))).toEqual(
        matches.map((entry) => entry.pokemon.displayName)
      )
      expect(wrapper.findAll('.pokemon-score').map((score) => score.text())).toEqual(
        matches.map((entry) => formatBfsIndex(entry.score))
      )
    }

    await search.setValue('no such pokemon')
    expect(wrapper.findAll('tbody img')).toHaveLength(0)
    expect(wrapper.get('[role="status"]').text()).toBe('No matching Pokémon')
    await wrapper.get('[data-testid="pokemon-search"] .v-field__clearable [role="button"]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('tbody tr')).toHaveLength(originalRows)
    expect(wrapper.findAll('tbody img')).toHaveLength(entries.length)
    wrapper.unmount()
  })

  it('matches names with straight, curly, or omitted punctuation', async () => {
    const wrapper = mount(BfsIndexPage)
    const search = wrapper.get('[data-testid="pokemon-search"] input')
    for (const query of ['farfetchd', "Farfetch'd", 'Farfetch’d']) {
      await search.setValue(query)
      const matches = wrapper.findAll('tbody img')
      expect(matches).toHaveLength(1)
      expect(matches[0].attributes('alt')).toMatch(/Farfetch/)
    }
    wrapper.unmount()
  })

  it('respects the unevolved toggle while searching', async () => {
    const wrapper = mount(BfsIndexPage)
    await wrapper.get('[data-testid="pokemon-search"] input').setValue('bulbasaur')
    expect(wrapper.findAll('tbody img')).toHaveLength(0)
    await wrapper.get('[data-testid="include-unevolved"] input').setValue(true)
    expect(wrapper.findAll('tbody img').map((img) => img.attributes('alt'))).toEqual(['Bulbasaur'])
    wrapper.unmount()
  })

  it('renders every calculated Pokémon in the correct row and order with accessible names', () => {
    const wrapper = mount(BfsIndexPage)
    const rows = buildBfsIndexRows()
    const renderedRows = wrapper.findAll('tbody tr')
    expect(renderedRows).toHaveLength(rows.length)
    rows.forEach((row, index) => {
      expect(renderedRows[index].find('th').text()).toBe(`${row.min.toFixed(1)} - <${row.max.toFixed(1)}`)
      expect(renderedRows[index].findAll('img').map((img) => img.attributes('alt'))).toEqual(
        row.entries.map((entry) => entry.pokemon.displayName)
      )
      expect(renderedRows[index].findAll('.pokemon-score').map((score) => score.text())).toEqual(
        row.entries.map((entry) => formatBfsIndex(entry.score))
      )
    })
    expect(wrapper.text()).toContain('Skill and “All” specialists:')
    expect(wrapper.find('a').attributes('href')).toContain('/1m9nnh3/')
    wrapper.unmount()
  })
  it('updates the Pokémon roster and recalculates sorted scores when toggles change', async () => {
    const wrapper = mount(BfsIndexPage)
    const unevolvedToggle = wrapper.get('[data-testid="include-unevolved"] input')
    const modifierToggle = wrapper.get('[data-testid="ingredient-finder-m"] input')
    expect((unevolvedToggle.element as HTMLInputElement).checked).toBe(false)
    expect((modifierToggle.element as HTMLInputElement).checked).toBe(true)

    await unevolvedToggle.setValue(true)
    expect(wrapper.findAll('tbody img')).toHaveLength(COMPLETE_POKEDEX.filter((p) => p.specialty !== 'berry').length)
    await modifierToggle.setValue(false)
    const expected = buildBfsIndexRows(undefined, { includeUnevolved: true, ingredientFinderM: false })
    expect(wrapper.findAll('tbody img').map((img) => img.attributes('alt'))).toEqual(
      expected.flatMap((row) => row.entries.map((entry) => entry.pokemon.displayName))
    )
    expect(wrapper.findAll('.pokemon-score').map((chip) => chip.text())).toEqual(
      expected.flatMap((row) => row.entries.map((entry) => formatBfsIndex(entry.score)))
    )
    for (const row of wrapper.findAll('tbody tr')) {
      row.findAll('.pokemon-score').forEach((chip, index) => {
        expect(chip.classes()).toContain(index % 2 === 0 ? 'bg-white' : 'bg-grey-lighten-2')
      })
    }
    await unevolvedToggle.setValue(false)
    expect(wrapper.findAll('tbody img')).toHaveLength(
      COMPLETE_POKEDEX.filter((p) => p.specialty !== 'berry' && p.remainingEvolutions === 0).length
    )
    wrapper.unmount()
  })
})
