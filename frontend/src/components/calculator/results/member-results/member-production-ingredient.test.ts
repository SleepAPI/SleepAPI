import MemberProductionIngredient from '@/components/calculator/results/member-results/member-production-ingredient.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockMemberProductionExt } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = createMockMemberProductionExt()

describe('MemberProductionIngredient', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionIngredient>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MemberProductionIngredient, {
      props: {
        memberWithProduction: mockMember
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with the provided member data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct number of ingredients', () => {
    const ingredientRows = wrapper.findAll('.ingredient-row')
    expect(ingredientRows.length).toBe(mockMember.production.produceTotal.ingredients.length)
  })

  it('renders the correct ingredient images and amounts', async () => {
    mockMember.production.produceTotal.ingredients.forEach(async (ingredient, index) => {
      const ingredientRow = wrapper.findAll('.ingredient-row').at(index)
      const img = ingredientRow?.find('img')
      const amountSpan = ingredientRow?.find('span.font-weight-medium')

      expect(img?.attributes('src')).toBe(`/images/ingredient/${ingredient.ingredient.name.toLowerCase()}.png`)
      const timeWindowFactor = StrengthService.timeWindowFactor(useTeamStore().timeWindow)
      expect(amountSpan?.text()).toBe(`x${Math.round(ingredient.amount * timeWindowFactor * 10) / 10}`)
    })
  })

  it('should prepare member ingredients correctly', () => {
    const preparedIngredients = wrapper.vm.prepareMemberIngredients(mockMember.production.produceTotal.ingredients)

    expect(preparedIngredients).toMatchInlineSnapshot(`
      [
        {
          "amount": 10,
          "image": "/images/ingredient/apple.png",
        },
        {
          "amount": 20,
          "image": "/images/ingredient/honey.png",
        },
      ]
    `)
  })
})
