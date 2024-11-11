import ChargeEnergySDetails from '@/components/calculator/results/member-results/member-production-skill-details/charge-energy-s-details.vue'
import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-skill.vue'
import { createMockMemberProductionExt, createMockPokemon } from '@/vitest'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = createMockMemberProductionExt({
  member: createMockPokemon({ pokemon: pokemon.TYRANITAR })
})

describe('MemberProductionSkill', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  beforeEach(() => {
    setActivePinia(createPinia())
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
          pokemon: pokemon.VAPOREON
        }
      }
    })

    expect(wrapper.vm.skillComponent).toBe('IngredientMagnetSDetails')
  })
})
