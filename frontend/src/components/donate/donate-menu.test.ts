import DonateMenu from '@/components/donate/donate-menu.vue'
import PatreonIcon from '@/components/icons/icon-patreon.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/components/icons/icon-patreon.vue', () => ({
  default: { template: '<svg />' }
}))

describe('DonateMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof DonateMenu>>

  beforeEach(() => {
    wrapper = mount(DonateMenu)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('clicking activator should open menu', async () => {
    expect(document.querySelector('#donateMenu')).toBeNull()

    const button = wrapper.find('#navBarIcon')
    expect(button).not.toBeNull()
    await button.trigger('click')

    await nextTick()

    expect(document.querySelector('#donateMenu')).not.toBeNull()
  })

  it('displays the correct icon depending on menu state', async () => {
    let icon = wrapper.find('i.mdi-heart-outline')
    expect(icon.exists()).toBe(true)

    await wrapper.setData({ menu: true })
    icon = wrapper.find('i.mdi-heart')
    expect(icon.exists()).toBe(true)
  })

  it('opens Patreon link when Patreon card is clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const button = wrapper.find('#navBarIcon')
    await button.trigger('click')

    const patreonCard = document.querySelector('#patreonButton')
    expect(patreonCard).not.toBeNull()
    if (patreonCard) {
      ;(patreonCard as HTMLElement).click()
      expect(openSpy).toHaveBeenCalledWith('https://www.patreon.com/SleepAPI', '_blank')
    }
    openSpy.mockRestore()
  })

  it('renders the PatreonIcon component', async () => {
    const button = wrapper.find('#navBarIcon')
    await button.trigger('click')

    const patreonIcon = wrapper.findComponent(PatreonIcon)
    expect(patreonIcon.exists()).toBe(true)
  })
})
