/* eslint-disable @typescript-eslint/no-explicit-any */
import TeamSlotMenu from '@/components/calculator/menus/team-slot-menu.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ingredient, nature, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/team/team-service', () => ({
  TeamService: {
    getTeams: vi.fn(),
    createOrUpdateTeam: vi.fn(),
    createOrUpdateMember: vi.fn(),
    removeMember: vi.fn()
  }
}))

describe('TeamSlotMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamSlotMenu>>
  let teamStore: ReturnType<typeof useTeamStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const externalId = 'external-id'
  const mockPokemon: PokemonInstanceExt = {
    name: 'Bubbles',
    externalId,
    pokemon: pokemon.PIKACHU,
    carrySize: 10,
    ingredients: [{ level: 1, ingredient: ingredient.FANCY_APPLE }],
    level: 10,
    nature: nature.BASHFUL,
    saved: false,
    skillLevel: 1,
    subskills: [],
    version: 1
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(TeamSlotMenu, {
      props: {
        show: true,
        memberIndex: 0
      }
    })
    teamStore = useTeamStore()
    pokemonStore = usePokemonStore()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly when the slot is empty', async () => {
    teamStore.teams[0].members[0] = undefined
    await wrapper.setProps({ show: true, memberIndex: 0 })
    expect(wrapper.vm.emptySlot).toBe(true)
    expect(document.querySelector('#emptyMenu')).not.toBeNull()
    expect(document.querySelector('#filledMenu')).toBeNull()
  })

  it('renders correctly when the slot is filled', async () => {
    pokemonStore.upsertPokemon(mockPokemon)
    teamStore.teams[0].members[0] = externalId // so isEmpty is false and we can see button
    await wrapper.setProps({ show: true, memberIndex: 0 })
    expect(wrapper.vm.emptySlot).toBe(false)
    expect(document.querySelector('#emptyMenu')).toBeNull()
    expect(document.querySelector('#filledMenu')).not.toBeNull()
  })

  it('opens PokemonSearch on add click', async () => {
    teamStore.teams[0].members[0] = undefined
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const addButton = document.querySelector('#addButton') as HTMLElement
    expect(addButton).not.toBeNull()
    addButton.click()

    expect(wrapper.vm.currentDialogComponent).toBe('PokemonSearch')
    expect(wrapper.vm.subDialog).toBe(true)
  })

  it('opens PokemonInput on edit click', async () => {
    pokemonStore.upsertPokemon(mockPokemon)
    teamStore.teams[0].members[0] = externalId
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const editButton = document.querySelector('#editButton') as HTMLElement
    expect(editButton).not.toBeNull()
    editButton.click()

    expect(wrapper.vm.currentDialogComponent).toBe('PokemonInput')
    expect(wrapper.vm.subDialog).toBe(true)
  })

  it('duplicates member', async () => {
    teamStore.duplicateMember = vi.fn()
    pokemonStore.upsertPokemon(mockPokemon)
    teamStore.teams[0].members[0] = externalId // so isEmpty is false and we can see button
    teamStore.teams[0].members[1] = undefined
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    duplicateButton.click()

    expect(teamStore.duplicateMember).toHaveBeenCalledWith(0)
  })

  it('removes member and closes dialog', async () => {
    teamStore.removeMember = vi.fn()
    pokemonStore.upsertPokemon(mockPokemon)
    teamStore.teams[0].members[0] = externalId // so isEmpty is false and we can see button
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const removeButton = document.querySelector('#removeButton') as HTMLElement
    expect(removeButton).not.toBeNull()
    removeButton.click()

    expect(teamStore.removeMember).toHaveBeenCalledWith(0)
  })

  it('disables duplicate button when team is full', async () => {
    pokemonStore.upsertPokemon(mockPokemon)
    teamStore.teams[0].members = new Array(MAX_TEAM_MEMBERS).fill(externalId) // so isEmpty is false and we can see button
    await wrapper.setProps({ show: true, memberIndex: 0 })
    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    expect(duplicateButton.classList).toContain('v-list-item--disabled')
  })
})
