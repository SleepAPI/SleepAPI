import type { SingleProductionExt } from '@/types/member/instanced'
import { defineStore } from 'pinia'

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
}

const MAX_COMPARISON_MEMBERS = 10

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
      recoveryIncense: false
    }
  },
  getters: {
    getMemberProduction: (state) => (externalId: string) =>
      state.members.find((member) => member.member.externalId === externalId),
    fullTeam: (state) => state.members.length >= MAX_COMPARISON_MEMBERS
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
