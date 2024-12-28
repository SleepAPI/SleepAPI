import SpeechBubble from '@/components//speech-bubble/speech-bubble.vue'
import { createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('SpeechBubble', () => {
  let wrapper: VueWrapper<InstanceType<typeof SpeechBubble>>

  beforeEach(() => {
    wrapper = mount(SpeechBubble, {
      props: {
        pokemonInstance: createMockPokemon()
      },
      slots: {
        'body-text': '<span class="custom-body-text">This is the body text</span>'
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders the default header text correctly', async () => {
    wrapper = mount(SpeechBubble, {
      props: {
        pokemonInstance: createMockPokemon({ level: 50, name: 'Abunzu' })
      },
      slots: {
        'body-text': '<span class="custom-body-text">This is the body text</span>'
      }
    })

    const headerLevel = wrapper.find('.text-black.text-left')
    expect(headerLevel.text()).toBe('Lv.50')

    const headerName = wrapper.find('.text-primary.font-weight-medium')
    expect(headerName.text()).toBe('Abunzu')
  })

  it('renders the custom body text slot correctly', () => {
    const bodyText = wrapper.find('.custom-body-text')
    expect(bodyText.exists()).toBe(true)
    expect(bodyText.text()).toBe('This is the body text')
  })

  it('renders the custom header-text slot when provided', () => {
    wrapper = mount(SpeechBubble, {
      props: {
        pokemonInstance: createMockPokemon()
      },
      slots: {
        'header-text': '<div class="custom-header">Custom Header Text</div>'
      }
    })

    const customHeader = wrapper.find('.custom-header')
    expect(customHeader.exists()).toBe(true)
    expect(customHeader.text()).toBe('Custom Header Text')

    const defaultHeader = wrapper.find('.text-black.text-left')
    expect(defaultHeader.exists()).toBe(false)
  })

  it('renders the divider correctly', () => {
    const divider = wrapper.findComponent({ name: 'VDivider' })
    expect(divider.exists()).toBe(true)
  })
})
