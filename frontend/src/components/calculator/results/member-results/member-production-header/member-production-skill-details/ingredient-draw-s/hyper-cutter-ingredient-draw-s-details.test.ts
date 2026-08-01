import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { MathUtils, VAPOREON } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import HyperCutterIngredientDrawSDetails from './hyper-cutter-ingredient-draw-s-details.vue'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: VAPOREON })
})

describe('HyperCutterIngredientDrawSDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof HyperCutterIngredientDrawSDetails>>

  beforeEach(async () => {
    wrapper = mount(HyperCutterIngredientDrawSDetails, {
      props: {
        memberWithProduction: mockMember
      }
    })
    await flushPromises()
    await vi.dynamicImportSettled()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with the provided member data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct skill level', () => {
    const skillLevelBadge = wrapper.find('#skillLevelBadge')
    expect(skillLevelBadge.text()).toBe('Lv.1')
  })

  it('renders the correct skill image', () => {
    const skillImageComponent = wrapper.find('[alt*="Ingredient Draw S (Hyper Cutter)"]')
    expect(skillImageComponent.exists()).toBe(true)
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct skill value per proc', () => {
    const skillValuePerProc = wrapper.find('.font-weight-light.text-body-2')
    expect(skillValuePerProc.text()).toBe(`x5-10`)
  })

  it('displays correct images using snapshot - no ingredients', () => {
    const images = wrapper.findAll('img')
    const imageData = images.map((img) => ({
      src: img.attributes('src'),
      alt: img.attributes('alt'),
      title: img.attributes('title')
    }))

    expect(imageData).toMatchInlineSnapshot(`
      [
        {
          "alt": "Ingredient Draw S (Hyper Cutter) level 1",
          "src": "/images/mainskill/ingredients.png",
          "title": "Ingredient Draw S (Hyper Cutter)",
        },
        {
          "alt": "skill activations",
          "src": "/images/misc/skillproc.png",
          "title": "skill activations",
        },
        {
          "alt": "ingredients",
          "src": "/images/ingredient/ingredients.png",
          "title": "ingredients",
        },
      ]
    `)
  })

  it('displays empty ingredient section when no ingredients are produced', () => {
    const ingredientSection = wrapper.find('.flex-center.ga-2')
    expect(ingredientSection.exists()).toBe(true)
    expect(ingredientSection.text().trim()).toBe('')
  })

  it('displays ingredient images when ingredient data is present', () => {
    const mockWithIngredients = mocks.createMockMemberWithProduction({
      member: mocks.createMockPokemon({ pokemon: VAPOREON }),
      production: {
        ...mocks.createMockMemberProduction(),
        produceFromSkill: {
          berries: [],
          ingredients: [
            { ingredient: mocks.mockIngredient({ name: 'Bean Sausage' }), amount: 5.2 },
            { ingredient: mocks.mockIngredient({ name: 'Tasty Mushroom' }), amount: 3.1 }
          ]
        }
      }
    })

    const ingredientWrapper = mount(HyperCutterIngredientDrawSDetails, {
      props: {
        memberWithProduction: mockWithIngredients
      }
    })

    const images = ingredientWrapper.findAll('img')
    const imageData = images.map((img) => ({
      src: img.attributes('src'),
      alt: img.attributes('alt'),
      title: img.attributes('title')
    }))

    expect(imageData.length).toBeGreaterThan(4)

    const ingredientImages = imageData.filter((img) => img.alt === 'Bean Sausage' || img.alt === 'Tasty Mushroom')
    expect(ingredientImages).toHaveLength(2)

    expect(imageData.some((img) => img.alt === 'Bean Sausage')).toBe(true)
    expect(imageData.some((img) => img.alt === 'Tasty Mushroom')).toBe(true)

    ingredientWrapper.unmount()
  })

  it('has the correct component name', () => {
    expect(wrapper.vm.$options.name).toBe('IngredientDrawSHyperCutterDetails')
  })

  it('renders skill activation image', () => {
    const skillProcImage = wrapper.find('img[alt="skill activations"]')
    expect(skillProcImage.exists()).toBe(true)
    expect(skillProcImage.attributes('src')).toBe('/images/misc/skillproc.png')
  })
})
