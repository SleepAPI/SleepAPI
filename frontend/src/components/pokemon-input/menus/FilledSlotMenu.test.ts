import PokemonSlotMenu from '@/components/pokemon-input/menus/FilledSlotMenu.vue'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { AuthProvider } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    getUserPokemon: vi.fn(),
    upsertPokemon: vi.fn(),
    deletePokemon: vi.fn()
  }
}))

describe('FilledSlotMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonSlotMenu>>
  let pokemonStore: ReturnType<typeof usePokemonStore>
  let userStore: ReturnType<typeof useUserStore>
  let dialogStore: ReturnType<typeof useDialogStore>

  const mockPokemon = mocks.createMockPokemon()

  beforeEach(() => {
    wrapper = mount(PokemonSlotMenu)
    userStore = useUserStore()
    pokemonStore = usePokemonStore()
    dialogStore = useDialogStore()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly when dialog is closed', async () => {
    dialogStore.filledSlotDialog = false
    await wrapper.vm.$nextTick()
    expect(document.querySelector('#filledMenu')).toBeNull()
  })

  it('renders correctly when dialog is open with pokemon', async () => {
    pokemonStore.upsertLocalPokemon(mockPokemon)
    dialogStore.openFilledSlot(mockPokemon, false, {})
    await wrapper.vm.$nextTick()
    expect(dialogStore.filledSlotDialog).toBe(true)
    expect(document.querySelector('#filledMenu')).not.toBeNull()
  })

  it('disables save button when user is not logged in', async () => {
    userStore.auth = null
    pokemonStore.upsertLocalPokemon(mockPokemon)
    dialogStore.openFilledSlot(mockPokemon, false, {})
    await wrapper.vm.$nextTick()

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    expect(saveButton.classList).toContain('v-list-item--disabled')
  })

  it('hides Schedule for Pokemon outside team slots', async () => {
    dialogStore.openFilledSlot(mockPokemon, false, {})
    await wrapper.vm.$nextTick()

    expect(document.querySelector('#filledMenu')).not.toBeNull()
    expect(document.querySelector('#scheduleButton')).toBeNull()
  })

  it('opens Schedule for the first team slot', async () => {
    dialogStore.openFilledSlot(mockPokemon, false, 0, {})
    await wrapper.vm.$nextTick()

    const scheduleButton = document.querySelector('#scheduleButton') as HTMLElement
    expect(scheduleButton).not.toBeNull()
    scheduleButton.click()
    await wrapper.vm.$nextTick()

    expect(dialogStore.scheduleDialog).toBe(true)
    expect(dialogStore.scheduleSlotIndex).toBe(0)
    expect(dialogStore.filledSlotDialog).toBe(false)
  })

  it('toggles save and calls server', async () => {
    vitest.useFakeTimers()

    userStore.auth = {
      tokens: {
        accessToken: 'test',
        refreshToken: 'test',
        expiryDate: Date.now() + 3600000
      },
      activeProvider: AuthProvider.Google,
      linkedProviders: {
        google: { linked: true },
        discord: { linked: false },
        patreon: { linked: false }
      }
    }
    pokemonStore.upsertLocalPokemon(mockPokemon)
    const onToggleSaved = vi.fn()
    dialogStore.openFilledSlot(mockPokemon, false, { onToggleSaved })
    await wrapper.vm.$nextTick()

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    // skip past debounce
    vitest.advanceTimersByTime(2000)

    expect(onToggleSaved).toHaveBeenCalledWith(true)
    vitest.useRealTimers()
  })

  it('opens PokemonInput on edit click', async () => {
    pokemonStore.upsertLocalPokemon(mockPokemon)
    const onUpdate = vi.fn()
    dialogStore.openFilledSlot(mockPokemon, false, { onUpdate })
    await wrapper.vm.$nextTick()

    const editButton = document.querySelector('#editButton') as HTMLElement
    expect(editButton).not.toBeNull()
    editButton.click()
    await wrapper.vm.$nextTick()

    expect(dialogStore.pokemonInputDialog).toBe(true)
    expect(dialogStore.filledSlotDialog).toBe(false)
  })

  it('duplicates member', async () => {
    const onDuplicate = vi.fn()
    dialogStore.openFilledSlot(mockPokemon, false, { onDuplicate })
    await wrapper.vm.$nextTick()

    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    duplicateButton.click()

    expect(onDuplicate).toHaveBeenCalled()
  })

  it('removes member and closes dialog', async () => {
    const onRemove = vi.fn()
    dialogStore.openFilledSlot(mockPokemon, false, { onRemove })
    await wrapper.vm.$nextTick()

    const removeButton = document.querySelector('#removeButton') as HTMLElement
    expect(removeButton).not.toBeNull()
    removeButton.click()

    expect(onRemove).toHaveBeenCalled()
    expect(dialogStore.filledSlotDialog).toBe(false)
  })

  it('disables duplicate button when team is full', async () => {
    pokemonStore.upsertLocalPokemon(mockPokemon)
    dialogStore.openFilledSlot(mockPokemon, true, {})
    await wrapper.vm.$nextTick()

    const duplicateButton = document.querySelector('#duplicateButton') as HTMLElement
    expect(duplicateButton).not.toBeNull()
    expect(duplicateButton.classList).toContain('v-list-item--disabled')
  })
})
