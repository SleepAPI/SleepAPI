import IslandImpact from '@/components/calculator/results/member-results/island-impact/island-impact.vue'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { berry, commonMocks, type IslandInstance, type PokemonInstance } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const expertIsland = (attrs?: Partial<Parameters<typeof commonMocks.expertModeSettings>[0]>): IslandInstance =>
  commonMocks.expertIslandInstance({ expertMode: commonMocks.expertModeSettings(attrs) })

const mainFavoriteMember = (): PokemonInstance =>
  mocks.createMockPokemon({ pokemon: commonMocks.mockPokemon({ berry: berry.BELUE }) })

const subFavoriteMember = (): PokemonInstance =>
  mocks.createMockPokemon({ pokemon: commonMocks.mockPokemon({ berry: berry.GREPA }) })

const notFavoredMember = (): PokemonInstance =>
  mocks.createMockPokemon({ pokemon: commonMocks.mockPokemon({ berry: berry.CHERI }) })

describe('IslandImpact', () => {
  let wrapper: VueWrapper<InstanceType<typeof IslandImpact>>

  beforeEach(() => {
    wrapper = mount(IslandImpact, {
      props: { member: mainFavoriteMember(), island: expertIsland(), effectiveSkillLevel: 2 }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Island Impact')
  })

  it('shows favorite berry power and area bonus for a base island', async () => {
    const userStore = useUserStore()
    userStore.islands['greengrass'].areaBonus = 35
    await wrapper.setProps({
      member: subFavoriteMember(),
      island: commonMocks.islandInstance({ berries: [berry.GREPA] })
    })
    expect(wrapper.text()).toContain('Grepa is a favorite berry')
    expect(wrapper.text()).toContain('2x berry power')
    expect(wrapper.text()).toContain('Mock Island')
    expect(wrapper.text()).toContain('35% area bonus')
  })

  it('shows the non-favored status without berry power for a base island', async () => {
    await wrapper.setProps({
      member: notFavoredMember(),
      island: commonMocks.islandInstance({ berries: [berry.GREPA] })
    })
    expect(wrapper.text()).toContain('Cheri is not favored')
    expect(wrapper.text()).not.toContain('berry power')
    expect(wrapper.text()).toContain('0% area bonus')
  })

  it('shows only the area bonus for an expert island without expert mode settings', async () => {
    await wrapper.setProps({ island: commonMocks.expertIslandInstance({ expertMode: undefined }) })
    expect(wrapper.text()).toContain('No favorite berries selected')
    expect(wrapper.text()).toContain('area bonus')
    expect(wrapper.text()).not.toContain('faster helps')
  })

  it('shows main favorite berry bonuses', () => {
    expect(wrapper.text()).toContain('Belue is the main favorite berry')
    expect(wrapper.text()).toContain('10% faster helps')
    expect(wrapper.text()).toContain('+1 main skill level')
    expect(wrapper.text()).toContain('Mock Island (Expert Mode)')
    expect(wrapper.text()).toContain('area bonus')
  })

  it('hides the skill level bonus when the main skill is already max level', async () => {
    const member = mainFavoriteMember()
    member.skillLevel = member.pokemon.skill.maxLevel
    await wrapper.setProps({ member, effectiveSkillLevel: member.skillLevel })
    expect(wrapper.text()).not.toContain('main skill level')
  })

  it('shows the ingredient random bonus for sub-favorite berries', async () => {
    await wrapper.setProps({ member: subFavoriteMember() })
    expect(wrapper.text()).toContain('Grepa is a sub-favorite berry')
    expect(wrapper.text()).toContain('+1 ingredient per ingredient help')
    expect(wrapper.text()).not.toContain('faster helps')
  })

  it('shows the boosted ingredient random bonus for ingredient specialists', async () => {
    const member = mocks.createMockPokemon({
      pokemon: commonMocks.mockPokemon({ berry: berry.GREPA, specialty: 'ingredient' })
    })
    await wrapper.setProps({ member })
    expect(wrapper.text()).toContain('+1-2 ingredients per ingredient help')
  })

  it('shows the berry random bonus for favored berries', async () => {
    await wrapper.setProps({ island: expertIsland({ randomBonus: 'berry' }) })
    expect(wrapper.text()).toContain('2.4x favored berry power')
  })

  it('shows the skill random bonus for favored berries', async () => {
    await wrapper.setProps({ island: expertIsland({ randomBonus: 'skill' }) })
    expect(wrapper.text()).toContain('1.25x main skill chance')
  })

  it('shows the help speed penalty for non-favored berries', async () => {
    await wrapper.setProps({ member: notFavoredMember() })
    expect(wrapper.text()).toContain('Cheri is not favored')
    expect(wrapper.text()).toContain('15% slower helps')
    expect(wrapper.text()).not.toContain('ingredient per help')
  })

  it('shows Cyan Beach expert mode bonuses for the main favorite berry', async () => {
    await wrapper.setProps({
      island: commonMocks.expertIslandInstance({ shortName: 'CBEX', expertMode: commonMocks.expertModeSettings() })
    })
    expect(wrapper.text()).toContain('20% faster helps')
    expect(wrapper.text()).toContain('+5 carry size')
  })

  it('shows the Cyan Beach help speed penalty for non-favored berries', async () => {
    await wrapper.setProps({
      member: notFavoredMember(),
      island: commonMocks.expertIslandInstance({ shortName: 'CBEX', expertMode: commonMocks.expertModeSettings() })
    })
    expect(wrapper.text()).toContain('35% slower helps')
    expect(wrapper.text()).not.toContain('carry size')
  })
})
