import CookingResults from '@/components/calculator/results/cooking-results.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockTeamProduction } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { curry } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CookingResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof CookingResults>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(CookingResults)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.production = createMockTeamProduction()
    await nextTick()

    // Check for cooking strength
    const strengthSpan = wrapper.find('#weeklyStrength')
    expect(strengthSpan.text()).toBe('1,750') // 1000 * 1.75

    // Check for Sunday strength
    const sundaySpan = wrapper.find('#sundayStrength')
    expect(sundaySpan.text()).toBe('175') // 100 * 1.75

    // Check for Weekday strength
    const weekdaySpan = wrapper.find('#weekdayStrength')
    expect(weekdaySpan.text()).toBe('1,575')
  })

  it('renders progress bars for each recipe correctly', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = createMockTeamProduction({
      team: {
        berries: [],
        ingredients: [],
        cooking: {
          curry: {
            cookedRecipes: [
              {
                recipe: curry.INFERNO_CORN_KEEMA_CURRY,
                count: 2,
                sunday: 1,
                ingredientLimited: [],
                potLimited: { averageMissing: 0, count: 0 },
                totalSkipped: 0
              },
              {
                recipe: curry.MILD_HONEY_CURRY,
                count: 1,
                sunday: 1,
                ingredientLimited: [],
                potLimited: { averageMissing: 0, count: 0 },
                totalSkipped: 0
              }
            ],
            sundayStrength: 100,
            weeklyStrength: 1000
          },
          salad: {
            cookedRecipes: [],
            sundayStrength: 0,
            weeklyStrength: 0
          },
          dessert: {
            cookedRecipes: [],
            sundayStrength: 0,
            weeklyStrength: 0
          }
        }
      }
    })
    await nextTick()

    const progressBars = wrapper.findAllComponents({ name: 'VProgressLinear' })
    expect(progressBars.length).toBe(3)

    const firstProgress = progressBars.at(1)
    const secondProgress = progressBars.at(2)

    expect(firstProgress?.text()).toContain('66.67%')
    expect(secondProgress?.text()).toContain('33.33%')
  })
})
