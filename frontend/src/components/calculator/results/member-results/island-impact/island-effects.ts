import {
  BASE_FAVORED_BERRY_MULTIPLIER,
  CBEX_MAIN_FREQUENCY_BUFF,
  CBEX_MAIN_INV_BUFF,
  CBEX_OFF_FREQUENCY_NERF,
  EXPERT_MODE_BERRY_BONUS_MULTIPLIER,
  EXPERT_MODE_MAIN_SKILL_LEVEL_BONUS,
  EXPERT_MODE_SKILL_PERCENT_BONUS,
  GGEX_MAIN_FREQUENCY_BUFF,
  GGEX_OFF_FREQUENCY_NERF,
  type IslandShortName
} from 'sleepapi-common'

export interface IslandEffect {
  image?: string
  icon?: string
  value: string
  valueClass: string
  text: string
}

export interface ExpertIslandEffectConfig {
  mainFavoriteExtraEffects: IslandEffect[]
  unfavoredExtraEffects: IslandEffect[]
}

export const EXPERT_ISLAND_EFFECTS: Partial<Record<IslandShortName, ExpertIslandEffectConfig>> = {
  GGEX: {
    mainFavoriteExtraEffects: [expertMainFasterHelps(GGEX_MAIN_FREQUENCY_BUFF)],
    unfavoredExtraEffects: [expertUnfavoredSlowerHelps(GGEX_OFF_FREQUENCY_NERF)]
  },
  CBEX: {
    mainFavoriteExtraEffects: [
      expertMainFasterHelps(CBEX_MAIN_FREQUENCY_BUFF),
      {
        icon: 'mdi-bag-personal-outline',
        value: `+${CBEX_MAIN_INV_BUFF}`,
        valueClass: 'text-help',
        text: 'carry size'
      }
    ],
    unfavoredExtraEffects: [expertUnfavoredSlowerHelps(CBEX_OFF_FREQUENCY_NERF)]
  }
}

export const baseFavoriteBerryEffect: IslandEffect = {
  image: '/images/berries/berries.png',
  value: `${BASE_FAVORED_BERRY_MULTIPLIER}x`,
  valueClass: 'text-berry',
  text: 'berry power'
}

export const expertMainFavoriteSkillLevel: IslandEffect = {
  image: '/images/misc/skillproc.png',
  value: `+${EXPERT_MODE_MAIN_SKILL_LEVEL_BONUS}`,
  valueClass: 'text-skill',
  text: 'main skill level'
}

export const expertIngredientBonus: IslandEffect = {
  image: '/images/ingredient/ingredients.png',
  value: '+1',
  valueClass: 'text-ingredient',
  text: 'ingredient per ingredient help'
}

export const expertIngredientSpecialtyBonus: IslandEffect = {
  image: '/images/ingredient/ingredients.png',
  value: '+1-2',
  valueClass: 'text-ingredient',
  text: 'ingredients per ingredient help'
}

export const expertBerryBonus: IslandEffect = {
  image: '/images/berries/berries.png',
  value: `${EXPERT_MODE_BERRY_BONUS_MULTIPLIER}x`,
  valueClass: 'text-berry',
  text: 'favored berry power'
}

export const expertSkillChanceBonus: IslandEffect = {
  image: '/images/misc/skillproc.png',
  value: `1.${EXPERT_MODE_SKILL_PERCENT_BONUS}x`,
  valueClass: 'text-skill',
  text: 'main skill chance'
}

function expertMainFasterHelps(helpIncrease: number): IslandEffect {
  return {
    image: '/images/mainskill/helps.png',
    value: `${helpIncrease}%`,
    valueClass: 'text-help',
    text: 'faster helps'
  }
}

function expertUnfavoredSlowerHelps(helpDecrease: number): IslandEffect {
  return {
    image: '/images/mainskill/helps.png',
    value: `${helpDecrease}%`,
    valueClass: 'text-help',
    text: 'slower helps'
  }
}
