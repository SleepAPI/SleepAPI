import { StockpileStrength, mainskill, pokemon, unitString } from 'sleepapi-common'

export function mainskillImage(pokemon: pokemon.Pokemon) {
  if (pokemon.skill.name === mainskill.HELPER_BOOST.name) {
    return `/images/type/${pokemon.berry.type}.png`
  } else {
    const stockpileVersion = pokemon.skill.unit === StockpileStrength
    const image = stockpileVersion ? 'stockpile_strength' : unitString(pokemon.skill)
    return `/images/mainskill/${image}.png`
  }
}

export function pokemonImage(params: { pokemonName: string; shiny: boolean }) {
  const { pokemonName, shiny } = params
  return `/images/pokemon/${pokemonName.toLowerCase()}${shiny ? '_shiny' : ''}.png`
}

export function avatarImage(params: { pokemonName: string; shiny: boolean; happy: boolean }) {
  const { pokemonName, shiny, happy } = params
  return `/images/avatar/${happy ? 'happy' : 'portrait'}/${pokemonName.toLowerCase()}${happy ? '_happy' : ''}${shiny ? '_shiny' : ''}.png`
}
