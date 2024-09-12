import { randomName } from '@/services/utils/name-utils'
import { faker } from '@faker-js/faker/locale/en'
import { describe, expect, it, vi } from 'vitest'

// Mock the faker module to control the output of firstName
vi.mock('@faker-js/faker/locale/en', () => {
  return {
    faker: {
      person: {
        firstName: vi.fn()
      }
    }
  }
})

describe('randomName', () => {
  it('returns a name within the specified max length', () => {
    const maxLength = 5

    // Mock the firstName method to return names of varying lengths
    faker.person.firstName = vi
      .fn()
      .mockReturnValueOnce('Alex')
      .mockReturnValueOnce('Alexander')
      .mockReturnValueOnce('Jane')

    const alex = randomName(maxLength, undefined)
    const jane = randomName(maxLength, undefined)
    expect(alex).toBe('Alex')
    expect(jane).toBe('Jane')
  })

  it('returns a valid name when maxLength is very large', () => {
    const maxLength = 100

    faker.person.firstName = vi.fn().mockReturnValue('Alexander')

    const name = randomName(maxLength, undefined)
    expect(name).toBe('Alexander')
  })

  it('shall call faker with gender', () => {
    faker.person.firstName = vi.fn().mockReturnValue('Louis')

    randomName(12, 'female')
    expect(faker.person.firstName).toHaveBeenLastCalledWith('female')
  })
})
