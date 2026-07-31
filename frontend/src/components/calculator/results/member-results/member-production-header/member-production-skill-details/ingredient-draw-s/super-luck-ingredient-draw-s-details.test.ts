import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { MathUtils, VAPOREON } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SuperLuckIngredientDrawSDetails from './super-luck-ingredient-draw-s-details.vue'

const mockMember = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({ pokemon: VAPOREON })
})

describe('SuperLuckIngredientDrawSDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof SuperLuckIngredientDrawSDetails>>

  beforeEach(async () => {
    wrapper = mount(SuperLuckIngredientDrawSDetails, {
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
    const skillImageComponent = wrapper.find('[alt*="Ingredient Draw S (Super Luck)"]')
    expect(skillImageComponent.exists()).toBe(true)
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
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
          "alt": "Ingredient Draw S (Super Luck) level 1",
          "src": "/images/mainskill/ingredients.png",
          "title": "Ingredient Draw S (Super Luck)",
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
        {
          "alt": "dream shards",
          "src": "/images/unit/shard.png",
          "title": "dream shards",
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
    const mockWithIngredients = mocks.createMockMemberProductionExt({
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

    const ingredientWrapper = mount(SuperLuckIngredientDrawSDetails, {
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

  it('displays total dream shard value', () => {
    const dreamShardElements = wrapper.find('[data-testid="dream-shard-total"]')
    expect(dreamShardElements.exists()).toBe(true)
  })

  it('has the correct component name', () => {
    expect(wrapper.vm.$options.name).toBe('IngredientDrawSSuperLuckDetails')
  })

  it('renders skill activation image', () => {
    const skillProcImage = wrapper.find('img[alt="skill activations"]')
    expect(skillProcImage.exists()).toBe(true)
    expect(skillProcImage.attributes('src')).toBe('/images/misc/skillproc.png')
  })

  it('renders dream shard image', () => {
    const dreamShardImage = wrapper.find('img[alt="dream shards"]')
    expect(dreamShardImage.exists()).toBe(true)
    expect(dreamShardImage.attributes('src')).toBe('/images/unit/shard.png')
  })
})
