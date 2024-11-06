import MemberProductionBerry from '@/components/calculator/results/member-results/member-production-berry.vue'
import MemberProductionHeader from '@/components/calculator/results/member-results/member-production-header.vue'
import MemberProductionIngredient from '@/components/calculator/results/member-results/member-production-ingredient.vue'
import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-skill.vue'
import { createMockMemberInstanceProduction } from '@/vitest/mocks/calculator/member-instance-production'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = createMockMemberInstanceProduction()

describe('MemberProductionHeader', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionHeader>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MemberProductionHeader, {
      props: {
        member: mockMember
      },
      global: {
        stubs: {
          MemberProductionBerry: true,
          MemberProductionIngredient: true,
          MemberProductionSkill: true
        }
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

  it('renders the MemberProductionBerry component', () => {
    const berryComponent = wrapper.findComponent(MemberProductionBerry)
    expect(berryComponent.exists()).toBe(true)
  })

  it('renders the MemberProductionIngredient component', () => {
    const ingredientComponent = wrapper.findComponent(MemberProductionIngredient)
    expect(ingredientComponent.exists()).toBe(true)
  })

  it('renders the MemberProductionSkill component', () => {
    const skillComponent = wrapper.findComponent(MemberProductionSkill)
    expect(skillComponent.exists()).toBe(true)
  })
})
