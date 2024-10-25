import { StockpileStrength, berry, island, mainskill, pokemon, unitString } from 'sleepapi-common'

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

export function islandImage(params: { favoredBerries: berry.Berry[]; background: boolean }) {
  const { favoredBerries, background } = params

  const berryNames = favoredBerries.map((b) => b.name)
  const maybeBackground = background ? 'background-' : ''

  const arraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false
    return arr1.every((value, index) => value === arr2[index])
  }

  const cyanKey = `/images/island/${maybeBackground}cyan.png`
  const taupeKey = `/images/island/${maybeBackground}taupe.png`
  const snowdropKey = `/images/island/${maybeBackground}snowdrop.png`
  const lapisKey = `/images/island/${maybeBackground}lapis.png`
  const powerplantKey = `/images/island/${maybeBackground}powerplant.png`

  const berryImageMap = {
    [cyanKey]: island.CYAN.berries,
    [taupeKey]: island.TAUPE.berries,
    [snowdropKey]: island.SNOWDROP.berries,
    [lapisKey]: island.LAPIS.berries,
    [powerplantKey]: island.POWER_PLANT.berries
  }

  for (const [imagePath, islandberries] of Object.entries(berryImageMap)) {
    const berryArrayNames = islandberries.map((b) => b.name)
    if (arraysEqual(berryNames, berryArrayNames)) {
      return imagePath
    }
  }

  return `/images/island/${maybeBackground}greengrass.png`
}
