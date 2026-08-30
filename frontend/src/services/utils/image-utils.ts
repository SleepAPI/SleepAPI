import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import { HelperBoost, type Berry, type Island, type MainskillUnit, type Pokemon } from 'sleepapi-common'

export function mainskillImage(pokemon: Pokemon) {
  if (pokemon.skill.is(HelperBoost)) {
    return `/images/type/${pokemon.berry.type}.png`
  } else {
    return `/images/mainskill/${pokemon.skill.image}.png`
  }
}

export function mainskillUnitImage(unit: MainskillUnit) {
  switch (unit) {
    case 'berries':
      return '/images/unit/berry.png'
    case 'candy':
      return '/images/misc/candy.png'
    case 'crit chance':
      return '/images/unit/crit.png'
    case 'dream shards':
      return '/images/unit/shard.png'
    case 'energy':
      return '/images/unit/energy.png'
    case 'helps':
      return '/images/unit/help.png'
    case 'ingredients':
      return '/images/unit/ingredient.png'
    case 'items':
      // TODO: replace unit with more specific name. Currently, only Shuckle finds items, so it's okay to always display that item.
      return '/images/misc/berry-juice.png'
    case 'pot size':
      return '/images/unit/pot.png'
    case 'skill helps':
      return '/images/unit/help.png'
    case 'strength':
      return '/images/unit/strength.png'
  }
}

export function ingredientImage(rawName: string) {
  const name = rawName.toLowerCase()
  return name === 'magnet' ? '/images/ingredient/ingredients.png' : `/images/ingredient/${name}.png`
}

export function recipeImage(rawName: string) {
  const name = rawName.toLowerCase()
  return `/images/recipe/${name.replace(/[_]/g, '').toLowerCase()}.png`
}

export function userAvatar(): string {
  const userStore = useUserStore()
  const avatarStore = useAvatarStore()
  const avatarName = userStore.avatar ?? 'default'

  return avatarStore.getAvatarPath(avatarName)
}

export function pokemonImage(params: { pokemonName: string; shiny: boolean }) {
  const { pokemonName, shiny } = params
  return `/images/pokemon/${pokemonName.toLowerCase()}${shiny ? '_shiny' : ''}.png`
}

export function avatarImage(params: { pokemonName: string; shiny: boolean; happy: boolean }) {
  const { pokemonName, shiny, happy } = params
  return `/images/avatar/${happy ? 'happy' : 'portrait'}/${pokemonName.toLowerCase()}${happy ? '_happy' : ''}${shiny ? '_shiny' : ''}.png`
}

export function berryImage(berry: Berry) {
  return `/images/berries/${berry.name.toLowerCase()}.png`
}

export function islandImage(params: {
  island: Pick<Island, 'shortName'> & { expert?: boolean; base?: Pick<Island, 'shortName'> }
  background?: boolean
}) {
  const { background = false, island } = params
  const maybeBackground = background ? 'background-' : ''
  // Expert islands have their own background art but reuse the base island's icon
  const shortName = !background && island.expert && island.base ? island.base.shortName : island.shortName

  return `/images/island/${maybeBackground}${shortName}.png`
}
