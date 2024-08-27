import type { SingleProductionExt } from '@/types/member/instanced'
import { defineStore } from 'pinia'

export interface ComparisonState {
  members: SingleProductionExt[]
}

const MAX_COMPARISON_MEMBERS = 10

export const useComparisonStore = defineStore('comparison', {
  state: (): ComparisonState => {
    return { members: [] }
  },
  getters: {
    getMemberProduction: (state) => (externalId: string) =>
      state.members.find((member) => member.member.externalId === externalId),
    fullTeam: (state) => state.members.length >= MAX_COMPARISON_MEMBERS
  },
  actions: {
    addMember(member: SingleProductionExt) {
      this.members.push(member)
    }
  },
  persist: true
})
