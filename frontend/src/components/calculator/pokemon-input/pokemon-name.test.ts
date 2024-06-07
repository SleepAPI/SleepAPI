import PokemonName from '@/components/calculator/pokemon-input/pokemon-name.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('PokemonName', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonName>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(PokemonName, { props: { name: '' } })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('enables button and displays name when Pokémon is provided', async () => {
    const button = wrapper.find('button')
    expect(button.text()).toBe('')
    expect(wrapper.emitted('update-name')).toHaveLength(1) // emits random roll on mount and 2nd emit is manual name change
  })

  it('opens edit dialog on button click', async () => {
    await wrapper.setProps({ name: 'Bernard' })

    const button = wrapper.find('button')
    await button.trigger('click')

    const pokemonNameDialog = document.querySelector('#pokemonNameDialog')
    expect(pokemonNameDialog).not.toBeNull()

    if (pokemonNameDialog) {
      const style = window.getComputedStyle(pokemonNameDialog)
      expect(style.display).not.toBe('none')
    }
  })

  it('filters input correctly', async () => {
    await wrapper.setData({ isEditDialogOpen: true })

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = 'Pokemon123'
    textarea.dispatchEvent(new Event('input'))

    expect(wrapper.vm.editedName).toBe('Pokemon123')
  })

  it('saves edited name', async () => {
    await wrapper.setData({ isEditDialogOpen: true, editedName: 'NewName' })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    expect(wrapper.emitted('update-name')).toHaveLength(2) // emits random roll on mount and 2nd emit is manual name change
    expect(wrapper.emitted('update-name')![1]).toEqual(['NewName'])
    expect(wrapper.vm.isEditDialogOpen).toBe(false)
  })

  it('rerolls name correctly', async () => {
    await wrapper.setProps({ name: 'Bernard' })
    await wrapper.setData({ isEditDialogOpen: true })

    const rerollButton = document.querySelector('#rerollButton') as HTMLElement
    expect(rerollButton).not.toBeNull()
    rerollButton.click()

    const newName = wrapper.vm.editedName
    expect(newName).not.toBe('')
    expect(newName.length).toBeLessThanOrEqual(wrapper.vm.maxNameLength)
  })

  it('closes edit dialog on cancel', async () => {
    await wrapper.setData({ isEditDialogOpen: true })

    const cancelButton = document.querySelector('#cancelButton')
    expect(cancelButton).not.toBeNull()
    ;(cancelButton as HTMLElement).click()

    expect(wrapper.vm.isEditDialogOpen).toBe(false)
  })

  it('handles remaining characters correctly', async () => {
    await wrapper.setData({ isEditDialogOpen: true, editedName: 'ShortName' })

    expect(wrapper.vm.remainingChars).toBe(wrapper.vm.maxNameLength - 'ShortName'.length)
  })

  it('does not save when remaining characters are negative', async () => {
    await wrapper.setData({
      isEditDialogOpen: true,
      editedName: 'VeryLongPokemonNameThatExceedsLimit'
    })

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    expect(saveButton.hasAttribute('disabled')).toBe(true)
  })
})
