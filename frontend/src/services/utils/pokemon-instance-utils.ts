import {
  getIngredient,
  getNature,
  getPokemon,
  getSubskill,
  type PokemonInstanceExt,
  type PokemonInstanceWithMeta
} from 'sleepapi-common'

class PokemonInstanceUtilsImpl {
  public toPokemonInstanceExt(pokemonInstance: PokemonInstanceWithMeta) {
    if (pokemonInstance.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (pokemonInstance.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
      version: pokemonInstance.version,
      saved: pokemonInstance.saved,
      shiny: pokemonInstance.shiny,
      externalId: pokemonInstance.externalId,
      pokemon: getPokemon(pokemonInstance.pokemon),
      name: pokemonInstance.name,
      level: pokemonInstance.level,
      ribbon: pokemonInstance.ribbon,
      carrySize: pokemonInstance.carrySize,
      skillLevel: pokemonInstance.skillLevel,
      nature: getNature(pokemonInstance.nature),
      subskills: pokemonInstance.subskills.map((instancedSubskill) => ({
        level: instancedSubskill.level,
        subskill: getSubskill(instancedSubskill.subskill)
      })),
      ingredients: pokemonInstance.ingredients.map((instancedIngredient) => ({
        level: instancedIngredient.level,
        ingredient: getIngredient(instancedIngredient.ingredient)
      }))
    }
  }

  public toUpsertTeamMemberRequest(instancedPokemon: PokemonInstanceExt): PokemonInstanceWithMeta {
    if (instancedPokemon.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (instancedPokemon.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
      version: instancedPokemon.version,
      saved: instancedPokemon.saved,
      shiny: instancedPokemon.shiny,
      externalId: instancedPokemon.externalId,
      pokemon: instancedPokemon.pokemon.name,
      name: instancedPokemon.name,
      level: instancedPokemon.level,
      ribbon: instancedPokemon.ribbon,
      carrySize: instancedPokemon.carrySize,
      skillLevel: instancedPokemon.skillLevel,
      nature: instancedPokemon.nature.name,
      subskills: instancedPokemon.subskills.map((instancedSubskill) => ({
        level: instancedSubskill.level,
        subskill: instancedSubskill.subskill.name
      })),
      ingredients: instancedPokemon.ingredients.map((instancedIngredient) => ({
        level: instancedIngredient.level,
        ingredient: instancedIngredient.ingredient.name
      }))
    }
  }
}

export const PokemonInstanceUtils = new PokemonInstanceUtilsImpl()
