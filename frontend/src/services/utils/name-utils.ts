import { faker } from '@faker-js/faker/locale/en'
import type { PokemonGender } from 'sleepapi-common'

export function randomName(maxLength: number, gender: PokemonGender) {
  let name = faker.person.firstName(gender)
  while (name.length > maxLength) {
    name = faker.person.firstName(gender)
  }
  return name
}
