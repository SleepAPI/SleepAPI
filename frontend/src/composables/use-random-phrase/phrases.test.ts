import { nature } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import { phrases } from './phrases'

describe('Nature Phrases', () => {
  it('should have phrases for every nature in the game', () => {
    nature.NATURES.forEach((nature) => {
      const natureName = nature.name
      expect(phrases).toHaveProperty(natureName)
      expect(phrases[natureName].length).toBeGreaterThan(0)
    })
  })
})
