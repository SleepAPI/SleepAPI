import { HelperBoost, type Berry, type Island, type Pokemon } from 'sleepapi-common';
import { useMainAppNavHref } from '../../composables/useMainAppNavHref';

export function mainskillImage(pokemon: Pokemon) {
  if (pokemon.skill.is(HelperBoost)) {
    return useMainAppNavHref()(`/images/type/${pokemon.berry.type}.png`);
  } else {
    return useMainAppNavHref()(`/images/mainskill/${pokemon.skill.image}.png`);
  }
}

export function ingredientImage(rawName: string) {
  const name = rawName.toLowerCase();
  return name === 'magnet'
    ? useMainAppNavHref()('/images/ingredient/ingredients.png')
    : useMainAppNavHref()(`/images/ingredient/${name}.png`);
}

export function recipeImage(rawName: string) {
  const name = rawName.toLowerCase();
  return useMainAppNavHref()(`/images/recipe/${name.replace(/[_]/g, '').toLowerCase()}.png`);
}

export function userAvatar(): string {
  return useMainAppNavHref()('/images/avatar/default.png');
}

export function pokemonImage(params: { pokemonName: string; shiny: boolean }) {
  const { pokemonName, shiny } = params;
  return useMainAppNavHref()(`/images/pokemon/${pokemonName.toLowerCase()}${shiny ? '_shiny' : ''}.png`);
}

export function avatarImage(params: { pokemonName: string; shiny: boolean; happy: boolean }) {
  const { pokemonName, shiny, happy } = params;
  return useMainAppNavHref()(
    `/images/avatar/${happy ? 'happy' : 'portrait'}/${pokemonName.toLowerCase()}${happy ? '_happy' : ''}${shiny ? '_shiny' : ''}.png`
  );
}

export function berryImage(berry: Berry) {
  return useMainAppNavHref()(`/images/berries/${berry.name.toLowerCase()}.png`);
}

export function islandImage(params: { island: Island; background?: boolean }) {
  const { background = false, island } = params;
  const maybeBackground = background ? 'background-' : '';

  return useMainAppNavHref()(`/images/island/${maybeBackground}${island.shortName}.png`);
}

export function miscImage(imageName: string) {
  return useMainAppNavHref()(`/images/misc/${imageName}.png`);
}
