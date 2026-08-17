import HomePage from '@/pages/home-page.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import 'vuetify/styles'

describe('HomePage.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof HomePage>>

  beforeEach(() => {
    wrapper = mount(HomePage)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should contain the correct title text', () => {
    const title = wrapper.find('h1.title')
    expect(title.text()).toBe("Neroli's Lab")
  })

  it('should contain the correct description text', () => {
    const description = wrapper.find('p')
    expect(description.text()).toBe('Helping you overthink sleep tracking.')
  })

  it('should contain the correct feature titles and descriptions', () => {
    const featureCards = wrapper.findAll('.feature-card')
    const featureTitles = featureCards.map((card) => card.find('h3'))
    const featureDescriptions = featureCards.map((card) => card.find('p.mb-2'))

    const expectedFeatures = [
      {
        title: 'Calculator',
        description: "Calculate your team's or Pokémon's production with our realistic Sleep API-powered simulations.",
        enabled: true
      },
      {
        title: 'Compare',
        description: 'Compare your Pokémon to each other before deciding on your investments.',
        enabled: true
      }
    ]

    expectedFeatures.forEach((feature, index) => {
      expect(featureTitles[index].text()).toBe(feature.title)
      expect(featureDescriptions[index].text()).toBe(feature.description)

      const cardHtml = featureCards[index].html()
      expect(cardHtml.includes('disabled')).toBe(!feature.enabled)
    })
  })

  it('should have get started buttons with primary color styling', () => {
    // Check for button elements with Get started text and primary color class
    const html = wrapper.html()

    // Should contain at least one button with "Get started" text
    expect(html).toMatch(/Get started/)

    // Vuetify applies primary color through bg-primary class
    expect(html).toMatch(/bg-primary/)

    // Should have both Get started text and primary color class
    const buttonRegex = /class="[^"]*bg-primary[^"]*"[^>]*>[^<]*<[^>]*>[^<]*<[^>]*>[\s\S]*?Get started/i
    expect(html).toMatch(buttonRegex)
  })

  it('should have fx01 class for button animations', () => {
    const getStartedButtons = wrapper.findAll('.fx01')
    expect(getStartedButtons.length).toBeGreaterThan(0)

    getStartedButtons.forEach((button) => {
      // Verify the fx01 class is present for animation styles
      expect(button.classes()).toContain('fx01')
    })
  })

  it('should not use SCSS variables directly in inline styles', () => {
    // Ensure no SCSS variables are used in the component template
    const html = wrapper.html()
    expect(html).not.toMatch(/\$primary/)
    expect(html).not.toMatch(/\$accent/)
    expect(html).not.toMatch(/background-color:\s*\$/)
  })
})
