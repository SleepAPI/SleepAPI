import CompareSlot from '@/components/compare/compare-slot.vue'
import type { MemberProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { berry, ingredient, subskill, type PokemonInstanceExt } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'

describe('CompareSlot', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareSlot>>

  const mockMemberProduction: MemberProductionExt = {
    member: createMockPokemon({
      name: 'Ash',
      subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }]
    }),
    ingredients: [
      {
        amount: 10,
        ingredient: ingredient.FANCY_APPLE
      },
      {
        amount: 20,
        ingredient: ingredient.HONEY
      }
    ],
    skillProcs: 5,
    berries: {
      amount: 100,
      berry: berry.BELUE
    }
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    wrapper = mount(CompareSlot, {
      props: {
        pokemonInstance: mockMemberProduction,
        fullTeam: true
      }
    })
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.vertical-text').text()).toBe('Ash')
    expect(wrapper.find('.pokemon-image img').attributes('src')).toBe(
      `/images/pokemon/${mockMemberProduction.member.pokemon.name.toLowerCase()}.png`
    )
    expect(wrapper.find('.responsive-text').text()).toBe('HB')
  })

  it('computed properties return correct values', () => {
    expect(wrapper.vm.imageUrl).toBe(
      `/images/pokemon/${mockMemberProduction.member.pokemon.name.toLowerCase()}.png`
    )
    expect(wrapper.vm.level).toBe('Level 10')
    expect(wrapper.vm.erb).toBe(false)
    expect(wrapper.vm.hb).toBe(true)
    expect(wrapper.vm.subskillBadge).toBe('HB')
  })

  it('openDialog method sets showDialog to true', async () => {
    expect(wrapper.vm.showDialog).toBe(false)
    await wrapper.find('.v-card').trigger('click')
    expect(wrapper.vm.showDialog).toBe(true)
  })

  it('emits edit-pokemon event correctly', async () => {
    const mockPokemonInstanceExt: PokemonInstanceExt = {
      ...mockMemberProduction.member,
      name: 'New Name'
    }
    wrapper.vm.editCompareMember(mockPokemonInstanceExt)
    expect(wrapper.emitted('edit-pokemon')).toBeTruthy()
    expect(wrapper.emitted('edit-pokemon')![0][0]).toEqual(mockPokemonInstanceExt)
  })

  it('emits duplicate-pokemon event correctly', async () => {
    const mockPokemonInstanceExt: PokemonInstanceExt = {
      ...mockMemberProduction.member,
      name: 'New Name'
    }
    wrapper.vm.duplicateCompareMember(mockPokemonInstanceExt)
    expect(wrapper.emitted('duplicate-pokemon')).toBeTruthy()
    expect(wrapper.emitted('duplicate-pokemon')![0][0]).toEqual(mockPokemonInstanceExt)
  })

  it('emits remove-pokemon event correctly', async () => {
    const mockPokemonInstanceExt: PokemonInstanceExt = {
      ...mockMemberProduction.member,
      name: 'New Name'
    }
    wrapper.vm.removeCompareMember(mockPokemonInstanceExt)
    expect(wrapper.emitted('remove-pokemon')).toBeTruthy()
    expect(wrapper.emitted('remove-pokemon')![0][0]).toEqual(mockPokemonInstanceExt)
  })

  it('shows PokemonSlotMenu when the card is clicked', async () => {
    const pokemonSlotMenu = wrapper.findComponent({ name: 'PokemonSlotMenu' })
    expect(wrapper.vm.showDialog).toBe(false)
    expect(pokemonSlotMenu.exists()).toBe(true)

    await wrapper.find('.v-card').trigger('click')
    expect(wrapper.vm.showDialog).toBe(true)
    expect(pokemonSlotMenu.props('show')).toBe(true)
  })
})
