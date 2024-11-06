import MemberProductionIngredient from '@/components/calculator/results/member-results/member-production-ingredient.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockMemberInstanceProduction } from '@/vitest/mocks/calculator/member-instance-production'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = createMockMemberInstanceProduction()
describe('MemberProductionIngredient', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionIngredient>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MemberProductionIngredient, {
      props: {
        member: mockMember
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
    expect(ingredientRows.length).toBe(mockMember.ingredients.length)
  })

  it('renders the correct ingredient images and amounts', async () => {
    mockMember.ingredients.forEach(async (ingredient, index) => {
      const ingredientRow = wrapper.findAll('.ingredient-row').at(index)
      const img = ingredientRow?.find('img')
      const amountSpan = ingredientRow?.find('span.font-weight-medium')

      expect(img?.attributes('src')).toBe(`${ingredient.name}`)
      const timeWindowFactor = StrengthService.timeWindowFactor(useTeamStore().timeWindow)
      expect(amountSpan?.text()).toBe(
        `x${Math.round(ingredient.amount * timeWindowFactor * 10) / 10}`
      )
    })
  })
})
