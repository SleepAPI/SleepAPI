import HomePage from '@/pages/home-page.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import 'vuetify/styles'

describe('HomePage.vue', () => {
  it('should contain the correct title text', () => {
    const wrapper = mount(HomePage)

    const title = wrapper.find('h1.title')
    expect(title.text()).toBe('Pokémon Sleep Simulations')
  })

  it('should contain the correct description text', () => {
    const wrapper = mount(HomePage)

    const description = wrapper.find('p')
    expect(description.text()).toBe(
      "Run your own simulation-based calculations with Sleep API's built-in data analysis."
    )
  })

  it('should contain the correct feature titles and descriptions', () => {
    const wrapper = mount(HomePage)

    const featureTitles = wrapper.findAll('h3')
    const featureDescriptions = wrapper.findAll('p.mb-2')

    const expectedFeatures = [
      {
        title: 'Calculator',
        description: "Simulate your Pokémon's production with in-depth data analysis."
      },
      {
        title: 'Compare',
        description: 'Compare your Pokémon to each other before deciding your investments.'
      },
      {
        title: 'Tier lists',
        description: 'Cooking tier lists based on millions of simulated recipe solutions.'
      },
      {
        title: 'Team finder',
        description: 'Find the most optimal teams for any given recipe.'
      }
    ]

    expectedFeatures.forEach((feature, index) => {
      expect(featureTitles[index].text()).toBe(feature.title)
      expect(featureDescriptions[index].text()).toBe(feature.description)
    })
  })
})
