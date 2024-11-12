import type { PerformanceDetails } from '@/types/member/instanced'

export function createMockMemberIv(attrs?: Partial<PerformanceDetails>): PerformanceDetails {
  return {
    berry: 50,
    ingredient: 50,
    skill: 50,
    ingredientsOfTotal: [50],
    ...attrs
  }
}
