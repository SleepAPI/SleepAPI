import { describe, expect, it } from 'vitest'
import { UnexpectedError } from './unexpected-error'

describe('UnexpectedError', () => {
  it('should create an error instance with the correct message', () => {
    const message = 'Something went wrong'
    const error = new UnexpectedError(message)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(UnexpectedError)
    expect(error.message).toBe(`Contact developer: ${message}`)
    expect(error.name).toBe('UnexpectedError')
  })
})
