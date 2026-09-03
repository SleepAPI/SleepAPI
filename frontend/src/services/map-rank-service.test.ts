import { projectedRankForStrength } from '@/services/map-rank-service'
import { describe, expect, it } from 'vitest'

describe('projectedRankForStrength', () => {
  it('uses the selected island thresholds', () => {
    expect(projectedRankForStrength(100000, 'greengrass')).toBe('Ultra 2')
    expect(projectedRankForStrength(100000, 'cyan')).toBe('Great 4')
  })

  it('uses the expert-map thresholds', () => {
    expect(projectedRankForStrength(14780152, 'CBEX')).toBe('Master 20')
  })
})
