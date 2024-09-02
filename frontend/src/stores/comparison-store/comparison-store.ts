import type { SingleProductionExt } from '@/types/member/instanced'
import { defineStore } from 'pinia'
import type { berry } from 'sleepapi-common'

export interface ComparisonState {
  members: SingleProductionExt[]
  camp: boolean
  bedtime: string
  wakeup: string
  e4e: number
  cheer: number
  helpingBonus: number
  erb: number
  extraHelpful: number
  helperBoost: number
  helperBoostUnique: number
  recoveryIncense: boolean
  timeWindow: '8H' | '24H'
  favoredBerries: berry.Berry[]
}

const MAX_COMPARISON_MEMBERS = 10
export const AVERAGE_WEEKLY_CRIT_MULTIPLIER = 1.171428571

export const useComparisonStore = defineStore('comparison', {
  state: (): ComparisonState => {
    return {
      members: [],
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      e4e: 0,
      cheer: 0,
      helpingBonus: 0,
      erb: 0,
      extraHelpful: 0,
      helperBoost: 0,
      helperBoostUnique: 1,
      recoveryIncense: false,
      timeWindow: '24H',
      favoredBerries: []
    }
  },
  getters: {
    getMemberProduction: (state) => (externalId: string) =>
      state.members.find((member) => member.member.externalId === externalId),
    fullTeam: (state) => state.members.length >= MAX_COMPARISON_MEMBERS,
    timewindowDivider: (state) => (state.timeWindow === '24H' ? 1 : 3)
  },
  actions: {
    addMember(member: SingleProductionExt) {
      this.members.push(member)
    },
    async toggleCamp() {
      this.camp = !this.camp
    },
    async toggleRecoveryIncense() {
      this.recoveryIncense = !this.recoveryIncense
    },
    async updateSleep(params: { bedtime: string; wakeup: string }) {
      const { bedtime, wakeup } = params
      this.bedtime = bedtime
      this.wakeup = wakeup
    }
  },
  persist: true
})
