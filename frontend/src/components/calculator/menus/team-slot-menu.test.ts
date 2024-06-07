import TeamSlotMenu from '@/components/calculator/menus/team-slot-menu.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAM_MEMBERS, type InstancedPokemonExt } from '@/types/member/instanced'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nature, pokemon } from 'sleepapi-common'
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
  let userStore: ReturnType<typeof useUserStore>

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
    teamStore.teams[0].members[0] = { name: 'Pikachu' } as any
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
    const member: InstancedPokemonExt = {
      index: 1,
      carrySize: 0,
      ingredients: [],
      level: 0,
      name: 'Bert',
      nature: nature.BASHFUL,
      pokemon: pokemon.PIKACHU,
      saved: false,
      skillLevel: 0,
      subskills: [],
      version: 0
    }
    teamStore.teams[0].members[0] = member
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const editButton = document.querySelector('#editButton') as HTMLElement
    expect(editButton).not.toBeNull()
    editButton.click()

    expect(wrapper.vm.currentDialogComponent).toBe('PokemonInput')
    expect(wrapper.vm.subDialog).toBe(true)
  })

  it('duplicates member', async () => {
    teamStore.duplicateMember = vi.fn()
    teamStore.teams[0].members[0] = { name: 'Pikachu', index: 0 } as any
    teamStore.teams[0].members[1] = undefined
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    duplicateButton.click()

    expect(teamStore.duplicateMember).toHaveBeenCalledWith(0)
  })

  it('removes member and closes dialog', async () => {
    teamStore.removeMember = vi.fn()
    teamStore.teams[0].members[0] = { name: 'Pikachu' } as any
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const removeButton = document.querySelector('#removeButton') as HTMLElement
    expect(removeButton).not.toBeNull()
    removeButton.click()

    expect(teamStore.removeMember).toHaveBeenCalledWith(0)
  })

  it('disables duplicate button when team is full', async () => {
    teamStore.teams[0].members = new Array(MAX_TEAM_MEMBERS).fill({ name: 'Pikachu' })
    await wrapper.setProps({ show: true, memberIndex: 0 })
    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    expect(duplicateButton.classList).toContain('v-list-item--disabled')
  })

  it('disables save button when user is not logged in', async () => {
    userStore.tokens = null
    teamStore.teams[0].members[0] = { name: 'Pikachu' } as any
    await wrapper.setProps({ show: true, memberIndex: 0 })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    expect(saveButton.classList).toContain('v-list-item--disabled')
  })

  it.todo('toggles save')
})
