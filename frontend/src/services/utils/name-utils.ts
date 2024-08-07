import { faker } from '@faker-js/faker/locale/en'

export function randomName(maxLength: number) {
  let name = faker.person.firstName()
  while (name.length > maxLength) {
    // TODO: we could save possible genders on each mon and pass, some mons can only be one gender, some have higher likelihood
    name = faker.person.firstName()
  }
  return name
}
