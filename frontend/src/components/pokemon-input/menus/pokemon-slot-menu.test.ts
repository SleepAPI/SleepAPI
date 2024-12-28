import PokemonSlotMenu from '@/components/pokemon-input/menus/pokemon-slot-menu.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
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
  let wrapper: VueWrapper<InstanceType<typeof PokemonSlotMenu>>
  let teamStore: ReturnType<typeof useTeamStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>
  let userStore: ReturnType<typeof useUserStore>

  const mockPokemon = createMockPokemon()

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(PokemonSlotMenu, {
      props: {
        show: true,
        fullTeam: false
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
    await wrapper.setProps({ show: true, pokemonFromPreExist: undefined })
    expect(wrapper.vm.emptySlot).toBe(true)
    expect(document.querySelector('#emptyMenu')).not.toBeNull()
    expect(document.querySelector('#filledMenu')).toBeNull()
  })

  it('renders correctly when the slot is filled', async () => {
    pokemonStore.upsertLocalPokemon(mockPokemon)
    await wrapper.setProps({ show: true, pokemonFromPreExist: mockPokemon })
    expect(wrapper.vm.emptySlot).toBe(false)
    expect(document.querySelector('#emptyMenu')).toBeNull()
    expect(document.querySelector('#filledMenu')).not.toBeNull()
  })

  it('disables save button when user is not logged in', async () => {
    userStore.tokens = null
    pokemonStore.upsertLocalPokemon(mockPokemon)
    teamStore.teams[0].members[0] = mockPokemon.externalId // so isEmpty is false and we can see button
    await wrapper.setProps({ show: true, pokemonFromPreExist: mockPokemon })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    expect(saveButton.classList).toContain('v-list-item--disabled')
  })

  it('toggles save and calls server', async () => {
    vitest.useFakeTimers()

    await wrapper.setProps({ show: true, pokemonFromPreExist: mockPokemon })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    // skip past debounce
    vitest.advanceTimersByTime(2000)

    expect(wrapper.emitted('toggle-saved-pokemon')).toHaveLength(1)
    const emittedEventPayload = wrapper.emitted('toggle-saved-pokemon')![0][0]

    expect(emittedEventPayload).toEqual(true)
    vitest.useRealTimers()
  })

  it('opens PokemonSearch on add click', async () => {
    await wrapper.setProps({ show: true, pokemonFromPreExist: undefined })

    const addButton = document.querySelector('#addButton') as HTMLElement
    expect(addButton).not.toBeNull()
    addButton.click()

    expect(wrapper.vm.currentDialogComponent).toBe('PokemonSearch')
    expect(wrapper.vm.subDialog).toBe(true)
  })

  it('opens PokemonInput on edit click', async () => {
    pokemonStore.upsertLocalPokemon(mockPokemon)
    teamStore.teams[0].members[0] = mockPokemon.externalId
    await wrapper.setProps({ show: true, pokemonFromPreExist: mockPokemon })

    const editButton = document.querySelector('#editButton') as HTMLElement
    expect(editButton).not.toBeNull()
    editButton.click()

    expect(wrapper.vm.currentDialogComponent).toBe('PokemonInput')
    expect(wrapper.vm.subDialog).toBe(true)
  })

  it('duplicates member', async () => {
    await wrapper.setProps({ show: true, pokemonFromPreExist: mockPokemon })

    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    duplicateButton.click()

    expect(wrapper.emitted('duplicate-pokemon')).toHaveLength(1)
  })

  it('removes member and closes dialog', async () => {
    await wrapper.setProps({ show: true, pokemonFromPreExist: mockPokemon })

    const removeButton = document.querySelector('#removeButton') as HTMLElement
    expect(removeButton).not.toBeNull()
    removeButton.click()

    expect(wrapper.emitted('remove-pokemon')).toHaveLength(1)
  })

  it('disables duplicate button when team is full', async () => {
    pokemonStore.upsertLocalPokemon(mockPokemon)
    await wrapper.setProps({ show: true, pokemonFromPreExist: mockPokemon, fullTeam: true })
    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    expect(duplicateButton.classList).toContain('v-list-item--disabled')
  })
})
