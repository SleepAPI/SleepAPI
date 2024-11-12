import { NerolisLabError } from '@/types/errors/nerolislab-error'

export class UnexpectedError extends NerolisLabError {
  constructor(message: string) {
    super(`Contact developer: ${message}`)
    this.name = 'UnexpectedError'
  }
}
