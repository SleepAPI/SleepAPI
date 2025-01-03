import { existsSync } from 'fs'
import path from 'path'
import { COMPLETE_POKEDEX } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

function checkMissingImages(imageTypeSuffix: string, folderPath: string): string[] {
  const imagesFolderPath = path.join(__dirname, folderPath)
  const missingImages: string[] = []

  COMPLETE_POKEDEX.forEach((poke) => {
    const imageName = `${poke.name.toLowerCase()}${imageTypeSuffix}.png`
    const imagePath = path.join(imagesFolderPath, imageName)

    if (!existsSync(imagePath)) {
      missingImages.push(imageName)
    }
  })

  return missingImages
}

describe('Pokémon images check', () => {
  it('should have a standard image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages('', '../../public/images/pokemon')
    expect(missingImages).toEqual([])
  })

  it('should have a shiny image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages('_shiny', '../../public/images/pokemon')
    expect(missingImages).toEqual([])
  })

  it('should have a portrait image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages('', '../../public/images/avatar/portrait')
    expect(missingImages).toEqual([])
  })

  it('should have a shiny portrait image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages('_shiny', '../../public/images/avatar/portrait')
    expect(missingImages).toEqual([])
  })

  it('should have a happy portrait image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages('_happy', '../../public/images/avatar/happy')
    expect(missingImages).toEqual([])
  })

  it('should have a happy shiny portrait image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages('_happy_shiny', '../../public/images/avatar/happy')
    expect(missingImages).toEqual([])
  })
})
