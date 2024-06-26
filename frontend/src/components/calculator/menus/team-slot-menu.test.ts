/* eslint-disable @typescript-eslint/no-explicit-any */
import TeamSlotMenu from '@/components/calculator/menus/team-slot-menu.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nature, pokemon, uuid, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'

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
  let userStore: ReturnType<typeof useUserStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(TeamSlotMenu, {
      props: {
        show: true,
        memberIndex: 0
      }
    })
    teamStore = useTeamStore()
    userStore = useUserStore()
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
    const externalId = uuid.v4()
    pokemonStore.upsertPokemon({ name: 'Pikachu', externalId } as any)
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
    const member: PokemonInstanceExt = {
      carrySize: 0,
      ingredients: [],
      level: 0,
      name: 'Bert',
      nature: nature.BASHFUL,
      pokemon: pokemon.PIKACHU,
      saved: false,
      skillLevel: 0,
      subskills: [],
      version: 0,
      externalId: uuid.v4()
    }
    pokemonStore.upsertPokemon(member)
    teamStore.teams[0].members[0] = member.externalId
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const editButton = document.querySelector('#editButton') as HTMLElement
    expect(editButton).not.toBeNull()
    editButton.click()

    expect(wrapper.vm.currentDialogComponent).toBe('PokemonInput')
    expect(wrapper.vm.subDialog).toBe(true)
  })

  it('duplicates member', async () => {
    teamStore.duplicateMember = vi.fn()
    const externalId = uuid.v4()
    pokemonStore.upsertPokemon({ name: 'Pikachu', externalId } as any)
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
    const externalId = uuid.v4()
    pokemonStore.upsertPokemon({ name: 'Pikachu', externalId } as any)
    teamStore.teams[0].members[0] = externalId // so isEmpty is false and we can see button
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const removeButton = document.querySelector('#removeButton') as HTMLElement
    expect(removeButton).not.toBeNull()
    removeButton.click()

    expect(teamStore.removeMember).toHaveBeenCalledWith(0)
  })

  it('disables duplicate button when team is full', async () => {
    const externalId = uuid.v4()
    pokemonStore.upsertPokemon({ name: 'Pikachu', externalId } as any)
    teamStore.teams[0].members = new Array(MAX_TEAM_MEMBERS).fill(externalId) // so isEmpty is false and we can see button
    await wrapper.setProps({ show: true, memberIndex: 0 })
    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    expect(duplicateButton.classList).toContain('v-list-item--disabled')
  })

  it('disables save button when user is not logged in', async () => {
    userStore.tokens = null
    const externalId = uuid.v4()
    pokemonStore.upsertPokemon({ name: 'Pikachu', externalId } as any)
    teamStore.teams[0].members[0] = externalId // so isEmpty is false and we can see button
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    expect(saveButton.classList).toContain('v-list-item--disabled')
  })

  it('toggles save and calls server', async () => {
    vitest.useFakeTimers()
    const member: PokemonInstanceExt = {
      carrySize: 0,
      ingredients: [],
      level: 0,
      name: 'Bert',
      nature: nature.BASHFUL,
      pokemon: pokemon.PIKACHU,
      saved: false,
      skillLevel: 0,
      subskills: [],
      version: 0,
      externalId: uuid.v4()
    }
    pokemonStore.upsertPokemon(member)
    teamStore.teams[0].members[0] = member.externalId
    teamStore.updateTeamMember = vi.fn()
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    // skip past debounce
    vitest.advanceTimersByTime(2000)

    expect(teamStore.updateTeamMember).toHaveBeenCalledWith({ ...member, saved: true }, 0)
    vitest.useRealTimers()
  })
})
