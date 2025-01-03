import { useUserStore } from '@/stores/user-store'
import type { TimeWindowWeek } from '@/types/time/time-window'
import type { Mainskill } from 'sleepapi-common'
import { MathUtils, berryPowerForLevel, type Berry, type BerrySet } from 'sleepapi-common'

class StrengthServiceImpl {
  public berryStrength(params: { berries: BerrySet[]; favored: Berry[]; timeWindow: TimeWindowWeek }) {
    const { berries, favored, timeWindow } = params
    const userStore = useUserStore()

    const timeWindowFactor = this.timeWindowFactor(timeWindow)

    let strength = 0
    for (const producedBerry of berries) {
      const favoredBerryMultiplier = favored.some((berry) => berry.name === producedBerry.berry.name) ? 2 : 1

      strength +=
        producedBerry.amount *
        timeWindowFactor *
        berryPowerForLevel(producedBerry.berry, producedBerry.level) *
        userStore.islandBonus *
        favoredBerryMultiplier
    }
    return Math.floor(strength)
  }

  public skillStrength(params: {
    skill: Mainskill
    amount: number
    berries: BerrySet[]
    favored: Berry[]
    timeWindow: TimeWindowWeek
  }) {
    const { skill, berries, favored, timeWindow } = params

    if (skill.isUnit('strength')) {
      return this.skillValue(params)
    } else if (skill.isUnit('berries')) {
      return this.berryStrength({ berries, favored, timeWindow })
    }

    return 0
  }

  public skillValue(params: { skill: Mainskill; amount: number; timeWindow: TimeWindowWeek }) {
    const { skill, amount, timeWindow } = params
    const userStore = useUserStore()

    const isStrengthUnit = skill.isUnit('strength')
    const isShardsUnit = skill.isUnit('dream shards')

    const rounding = isStrengthUnit || isShardsUnit ? 0 : 1

    return MathUtils.round(
      isStrengthUnit
        ? amount * userStore.islandBonus * this.timeWindowFactor(timeWindow)
        : amount * this.timeWindowFactor(timeWindow),
      rounding
    )
  }

  public timeWindowFactor(timeWindow: TimeWindowWeek) {
    switch (timeWindow) {
      case 'WEEK':
        return 7
      case '24H':
        return 1
      case '8H':
        return 1 / 3
      default:
        return 1
    }
  }
}

export const StrengthService = new StrengthServiceImpl()
