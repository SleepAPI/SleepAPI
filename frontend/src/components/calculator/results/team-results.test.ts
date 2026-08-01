import TeamResults from '@/components/calculator/results/team-results.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import { mockCookingResult } from '@/vitest/mocks/calculator/mock-cooking-result'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { MathUtils, berry, compactNumber, type MemberSkillValue } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('TeamResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamResults>>

  beforeEach(() => {
    wrapper = mount(TeamResults)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = {
      team: {
        cooking: {
          curry: {
            weeklyStrength: 1000,
            sundayStrength: 100,
            cookedRecipes: []
          },
          salad: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          dessert: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          critInfo: mocks.createMockTeamProduction().team.cooking!.critInfo,
          mealTimes: mockCookingResult().mealTimes
        },
        berries: [],
        ingredients: []
      },
      members: []
    }
    await nextTick()

    const strengthSpan = wrapper.find('#weeklyStrength')
    expect(strengthSpan.text()).toBe('1,000')
    const totalStrength = wrapper.vm.totalStrengthString
    expect(totalStrength).toBe('1,000')
  })

  it('renders the stacked bar with correct percentages', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mocks.createMockPokemon())

    const baseProduction = mocks.createMockMemberWithProduction().production
    const memberProduction = mocks.createMockMemberWithProduction({
      production: {
        ...baseProduction,
        produceTotal: {
          ingredients: [],

          berries: [{ amount: 10, berry: berry.BELUE, level: 10 }]
        },
        produceWithoutSkill: {
          ingredients: [],

          berries: [{ amount: 10, berry: berry.BELUE, level: 10 }]
        },
        skillValue: {
          strength: {
            amountToSelf: 400,
            amountToTeam: 0
          }
        } as MemberSkillValue,
        strength: {
          ...baseProduction.strength,
          berries: {
            total: 414.3,
            breakdown: {
              base: 350,
              favored: 40,
              islandBonus: 24.3
            }
          },
          skill: {
            total: 400,
            breakdown: {
              base: 350,
              islandBonus: 50
            }
          }
        }
      }
    }).production

    teamStore.getCurrentTeam.production = {
      team: {
        cooking: {
          curry: {
            weeklyStrength: 10000,
            sundayStrength: 0,
            cookedRecipes: []
          },
          salad: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          dessert: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          critInfo: mocks.createMockTeamProduction().team.cooking!.critInfo,
          mealTimes: {
            breakfast: { hour: 8, minute: 0, second: 0 },
            lunch: { hour: 12, minute: 0, second: 0 },
            dinner: { hour: 18, minute: 0, second: 0 }
          }
        },
        berries: [],
        ingredients: []
      },
      members: [memberProduction]
    }
    await nextTick()

    const stackedBar = wrapper.findComponent({ name: 'StackedBar' })
    expect(stackedBar.exists()).toBe(true)

    const weeklyFactor = timeWindowFactor('WEEK')
    const cookingStrength = 10000
    const berryStrength = Math.floor(memberProduction.strength.berries.total * weeklyFactor)
    const skillStrength = Math.floor(memberProduction.strength.skill.total * weeklyFactor)
    const totalStrength = Math.floor(cookingStrength + berryStrength + skillStrength)
    const berryPercentage = MathUtils.floor((berryStrength / totalStrength) * 100, 1)
    const skillPercentage = MathUtils.floor((skillStrength / totalStrength) * 100, 1)
    const cookingPercentage = MathUtils.floor((cookingStrength / totalStrength) * 100, 1)

    expect(stackedBar.props('sections')).toEqual([
      {
        color: 'curry',
        percentage: cookingPercentage,
        sectionText: `${cookingPercentage}%`,
        tooltipText: `${compactNumber(cookingStrength)} (${cookingPercentage}%)`
      },
      {
        color: 'berry',
        percentage: berryPercentage,
        sectionText: `${berryPercentage}%`,
        tooltipText: `${compactNumber(berryStrength)} (${berryPercentage}%)`
      },
      { color: 'berry-light', percentage: 0, sectionText: '0%', tooltipText: '0 (0%)' },
      {
        color: 'skill',
        percentage: skillPercentage,
        sectionText: `${skillPercentage}%`,
        tooltipText: `${compactNumber(skillStrength)} (${skillPercentage}%)`
      }
    ])
  })

  it('renders member progress bars correctly', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = mocks.createMockTeamProduction()
    await nextTick()

    const progressBars = wrapper.findAll('#memberBar')
    expect(progressBars.length).toBe(1)
  })
})
