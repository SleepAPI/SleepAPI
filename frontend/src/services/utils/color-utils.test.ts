import { hexToRgba } from '@/services/utils/color-utils'
import { describe, expect, it } from 'vitest'

describe('hexToRgba', () => {
  it('converts 6-character hex to rgba correctly', () => {
    expect(hexToRgba('#ff5733', 0.5)).toBe('rgba(255, 87, 51, 0.5)')
  })

  it('converts 3-character hex to rgba correctly', () => {
    expect(hexToRgba('#f53', 0.7)).toBe('rgba(255, 85, 51, 0.7)')
  })

  it('handles hex without # correctly', () => {
    expect(hexToRgba('4287f5', 1)).toBe('rgba(66, 135, 245, 1)')
  })

  it('handles opacity of 0 correctly', () => {
    expect(hexToRgba('#000000', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  it('handles full opacity correctly', () => {
    expect(hexToRgba('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)')
  })
})
