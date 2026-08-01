import MemberStats from '@/components/calculator/results/member-results/member-stats/member-stats.vue'
import SkillDistribution from '@/components/calculator/results/member-results/member-stats/skill-distribution.vue'
import type { MemberWithProduction } from '@/types/member/instanced'
import { mocks } from '@/vitest'
import { mount } from '@vue/test-utils'
import { commonMocks, subskill } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

// Create a dummy production with additional properties: level, ingredient list, and dayPeriod values
const pokemonProduction: MemberWithProduction = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({
    rp: 100,
    level: 5,
    ingredients: [
      {
        ...commonMocks.mockIngredientSet({
          amount: 2,
          ingredient: commonMocks.mockIngredient({ name: 'Ingredient A' })
        }),
        level: 10
      },
      {
        ...commonMocks.mockIngredientSet({
          amount: 2,
          ingredient: commonMocks.mockIngredient({ name: 'Ingredient A' })
        }),
        level: 30
      }
    ]
  }),
  production: mocks.createMockMemberProduction({
    advanced: {
      ...mocks.createMockMemberProduction().advanced,
      carrySize: 50,
      dayPeriod: {
        averageFrequency: 120,
        averageEnergy: 3.333,
        spilledIngredients: []
      },
      nightPeriod: {
        averageEnergy: 0,
        averageFrequency: 60,
        spilledIngredients: [
          commonMocks.mockIngredientSet({ amount: 10, ingredient: commonMocks.mockIngredient({ name: 'Mock Ing' }) })
        ]
      },
      maxFrequency: 3600
    }
  })
})

describe('MemberStats.vue', () => {
  beforeEach(() => {})

  it('renders RP correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('RP 100')
  })

  it('renders carry size correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('Carry limit: 50')
  })

  it('renders spilled ingredients correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('spilled')
    expect(wrapper.text()).toContain('10')
  })

  it('renders ingredient image correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const imgs = wrapper.findAll('img')
    // Check that at least one image's src includes the ingredient name (case-insensitive)
    expect(imgs.some((img) => img.attributes('src')?.toLowerCase().includes('mock ing'))).toBe(true)
  })

  it('renders level correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('Level 5')
  })

  it('renders ingredient list correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    // Verify that the "Ingredient list" label appears…
    expect(wrapper.text()).toContain('Ingredient list')
    // …and that each ingredient in the list shows the static value "2"
    const countSpans = wrapper.findAll('span').filter((span) => span.text().trim() === '2')
    expect(countSpans.length).toBe(2)
  })

  it('renders day period values correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const dayCard = wrapper.find('.day-card')
    expect(dayCard.exists()).toBe(true)
    expect(dayCard.text()).toContain('Average Frequency: 02m 00s')
    expect(dayCard.text()).toContain('Average Energy: 3.3')
  })

  it('renders night period values correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const nightCard = wrapper.find('.night-card')
    expect(nightCard.exists()).toBe(true)
    expect(nightCard.text()).toContain('Average Frequency: 01m')
    expect(nightCard.text()).toContain('Average Energy: 0')
  })

  it('does not render spilled ingredients section when none exist', () => {
    // Create a production with no spilled ingredients
    const productionWithoutSpilled: MemberWithProduction = mocks.createMockMemberWithProduction({
      member: mocks.createMockPokemon({
        rp: 100,
        level: 5,
        ingredients: [
          {
            ...commonMocks.mockIngredientSet({
              amount: 2,
              ingredient: commonMocks.mockIngredient({ name: 'Ingredient A' })
            }),
            level: 10
          }
        ]
      }),
      production: mocks.createMockMemberProduction({
        advanced: {
          ...mocks.createMockMemberProduction().advanced,
          carrySize: 50,
          dayPeriod: {
            averageFrequency: 120,
            averageEnergy: 3.333,
            spilledIngredients: []
          },
          nightPeriod: {
            averageEnergy: 0,
            averageFrequency: 60,
            spilledIngredients: []
          },
          maxFrequency: 3600
        }
      })
    })
    const wrapper = mount(MemberStats, { props: { pokemonProduction: productionWithoutSpilled } })
    const nightCard = wrapper.find('.night-card')
    expect(nightCard.text()).not.toContain('spilled')
  })

  it('renders subskill carry bonus when greater than 0', () => {
    const productionWithSubskills: MemberWithProduction = mocks.createMockMemberWithProduction({
      member: mocks.createMockPokemon({
        subskills: [
          { subskill: subskill.INVENTORY_S, level: 10 },
          { subskill: subskill.INVENTORY_M, level: 25 }
        ]
      })
    })

    const wrapper = mount(MemberStats, { props: { pokemonProduction: productionWithSubskills } })
    expect(wrapper.text()).toContain('from subskills')
    const subskillDiv = wrapper.find('.text-small.mr-4.flex-center')
    expect(subskillDiv.exists()).toBe(true)
  })

  it('renders ribbon carry bonus when greater than 0', () => {
    const productionWithRibbon: MemberWithProduction = mocks.createMockMemberWithProduction({
      member: mocks.createMockPokemon({ ribbon: 2 })
    })

    const wrapper = mount(MemberStats, { props: { pokemonProduction: productionWithRibbon } })
    expect(wrapper.text()).toContain('from ribbon')
    const ribbonDiv = wrapper.find('.text-small.flex-center')
    expect(ribbonDiv.exists()).toBe(true)
  })

  it('does not render subskill bonus when value is 0', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).not.toContain('from subskills')
  })

  it('does not render ribbon bonus when value is 0', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).not.toContain('from ribbon')
  })

  it('renders both subskill and ribbon bonuses when both are greater than 0', () => {
    const productionWithBoth: MemberWithProduction = mocks.createMockMemberWithProduction({
      member: mocks.createMockPokemon({
        ribbon: 2,
        subskills: [
          { subskill: subskill.INVENTORY_S, level: 10 },
          { subskill: subskill.INVENTORY_M, level: 25 }
        ]
      })
    })

    const wrapper = mount(MemberStats, { props: { pokemonProduction: productionWithBoth } })
    expect(wrapper.text()).toContain('from subskills')
    expect(wrapper.text()).toContain('from ribbon')

    // Should have both divs with proper spacing
    const subskillDiv = wrapper.find('.text-small.mr-4.flex-center')
    const ribbonDiv = wrapper.find('.text-small.flex-center:not(.mr-4)')
    expect(subskillDiv.exists()).toBe(true)
    expect(ribbonDiv.exists()).toBe(true)
  })
})

describe('MemberStats.vue - Mobile Viewport', () => {
  beforeEach(() => {
    vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
      useBreakpoint: () => ({ isMobile: true })
    }))
  })

  afterEach(() => {
    vi.resetModules() // Reset the module registry to remove our mock
  })

  it('applies mobile class to SkillDistribution component', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const skillDistribution = wrapper.findComponent(SkillDistribution)
    expect(skillDistribution.exists()).toBe(true)
    expect(skillDistribution.classes()).toContain('mx-auto')
  })
})
