import ChargeEnergySDetails from '@/components/calculator/results/member-results/member-production-header/member-production-skill-details/charge-energy-s/charge-energy-s-details.vue'
import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { TYRANITAR, VAPOREON } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: TYRANITAR })
})

describe('MemberProductionSkill', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  beforeEach(async () => {
    wrapper = mount(MemberProductionSkill, {
      props: {
        memberWithProduction: mockMember
      },
      global: {
        components: {
          ChargeEnergySDetails
        }
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

  it('dynamically renders the correct skill component based on skill name', () => {
    const skillComponent = wrapper.findComponent(ChargeEnergySDetails)
    expect(skillComponent.exists()).toBe(true)
  })

  it('updates the component when skill name changes', async () => {
    await wrapper.setProps({
      memberWithProduction: {
        ...mockMember,
        member: {
          ...mockMember.member,
          pokemon: VAPOREON
        }
      }
    })

    // Wait for the dynamic component to be fully resolved
    await flushPromises()
    await vi.dynamicImportSettled()

    // Access the resolved component's name
    const skillComponent = wrapper.vm.skillComponent
    expect(skillComponent.__asyncResolved.name).toBe('IngredientMagnetSDetails')
  })
})
