import { mainskill, type pokemon } from 'sleepapi-common'

export function mainskillImage(pokemon: pokemon.Pokemon) {
  if (pokemon.skill.name === mainskill.HELPER_BOOST.name) {
    return `/images/type/${pokemon.berry.type}.png`
  } else {
    const stockpileVersion = pokemon.skill.unit === 'stockpile'
    const image = stockpileVersion ? 'stockpile_strength' : pokemon.skill.unit.toLowerCase()
    return `/images/mainskill/${image}.png`
  }
}
