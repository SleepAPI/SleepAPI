import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useTeamStore } from '@/stores/team/team-store'
import axios from 'axios'
import {
  mainskill,
  maxCarrySize,
  subskill,
  type PokemonInstanceExt,
  type SingleProductionRequest,
  type SingleProductionResponse
} from 'sleepapi-common'

class ProductionServiceImpl {
  public async calculateSingleProduction(pokemonName: string, request: SingleProductionRequest) {
    const response = await axios.post<SingleProductionResponse>(
      `/api/calculator/production/${pokemonName}?includeAnalysis=true`,
      request
    )

    return response.data
  }

  public async calculateTeamMemberProduction(params: { teamIndex: number; memberIndex: number }) {
    const { teamIndex, memberIndex } = params

    const teamStore = useTeamStore()
    const team = teamStore.teams[teamIndex]
    const member = team?.production?.members[memberIndex].member
    const otherTeamMembers = team?.production?.members.filter(
      (m) => m.member.externalId !== member?.externalId
    )

    if (!team || !member || !otherTeamMembers) {
      console.error("Contact developer, can't find team or member for team single production")
      return
    }

    const erb = otherTeamMembers.filter(({ member }) =>
      member.subskills.some(
        ({ subskill: memberSubskill, level }) =>
          memberSubskill.name.toLowerCase() === subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase() &&
          level <= member.level
      )
    ).length
    const helpingbonus = otherTeamMembers.filter(({ member }) =>
      member.subskills.some(
        ({ subskill: memberSubskill, level }) =>
          memberSubskill.name.toLowerCase() === subskill.HELPING_BONUS.name.toLowerCase() &&
          level <= member.level
      )
    ).length

    let cheer = 0
    let e4eProcs = 0
    let e4eLevel = 0
    let extraHelpful = 0
    let helperBoostProcs = 0
    let helperBoostLevel = 0
    let helperBoostUnique = 0
    for (const otherMember of otherTeamMembers) {
      const skillName = otherMember.member.pokemon.skill.name
      if (skillName === mainskill.ENERGIZING_CHEER_S.name) {
        cheer += otherMember.skillProcs
      } else if (skillName === mainskill.ENERGY_FOR_EVERYONE.name) {
        e4eProcs += otherMember.skillProcs
        e4eLevel =
          e4eLevel === 0
            ? otherMember.member.skillLevel
            : Math.max(e4eLevel, otherMember.member.skillLevel)
      } else if (skillName === mainskill.EXTRA_HELPFUL_S.name) {
        extraHelpful += otherMember.skillProcs
      } else if (skillName === mainskill.HELPER_BOOST.name) {
        helperBoostProcs += otherMember.skillProcs
        helperBoostLevel =
          helperBoostLevel === 0
            ? otherMember.member.skillLevel
            : Math.max(e4eLevel, otherMember.member.skillLevel)

        const unique =
          team.production?.members?.filter(
            (m) => m.member.pokemon.berry.name === otherMember.member.pokemon.berry.name
          ).length ?? 1

        helperBoostUnique = helperBoostUnique === 0 ? unique : Math.max(helperBoostUnique, unique)
      }
    }

    const nrOfEvolutions = (maxCarrySize(member.pokemon) - member.carrySize) / 5
    const settings: SingleProductionRequest = {
      camp: team.camp,
      cheer,
      e4eLevel,
      e4eProcs,
      erb,
      extraHelpful,
      helperBoostLevel,
      helperBoostProcs,
      helperBoostUnique,
      helpingbonus,
      mainBedtime: team.bedtime,
      mainWakeup: team.wakeup,
      recoveryIncense: false, // TODO: maybe in future
      level: member.level,
      nature: member.nature.name,
      ribbon: member.ribbon,
      skillLevel: member.skillLevel,
      ingredientSet: member.ingredients.map(({ ingredient }) => ingredient.name),
      subskills: member.subskills.sort((a, b) => a.level - b.level).map((s) => s.subskill.name),
      nrOfEvolutions
    }

    return await this.calculateSingleProduction(member.pokemon.name, settings)
  }

  public async calculateCompareProduction(pokemonInstance: PokemonInstanceExt) {
    const comparisonStore = useComparisonStore()
    const defaultSettings = {
      camp: comparisonStore.camp,
      cheer: comparisonStore.cheer,
      e4eLevel: mainskill.ENERGY_FOR_EVERYONE.maxLevel,
      e4eProcs: comparisonStore.e4e,
      erb: comparisonStore.erb,
      extraHelpful: comparisonStore.extraHelpful,
      helperBoostLevel: mainskill.HELPER_BOOST.maxLevel,
      helperBoostProcs: comparisonStore.helperBoost,
      helperBoostUnique: comparisonStore.helperBoostUnique,
      helpingbonus: comparisonStore.helpingBonus,
      mainBedtime: comparisonStore.bedtime,
      mainWakeup: comparisonStore.wakeup,
      recoveryIncense: comparisonStore.recoveryIncense
    }

    const nrOfEvolutions = (maxCarrySize(pokemonInstance.pokemon) - pokemonInstance.carrySize) / 5

    const request: SingleProductionRequest = {
      ...defaultSettings,
      level: pokemonInstance.level,
      skillLevel: pokemonInstance.skillLevel,
      ribbon: pokemonInstance.ribbon,
      nature: pokemonInstance.nature.name,
      subskills: pokemonInstance.subskills
        .sort((a, b) => a.level - b.level)
        .map((s) => s.subskill.name),
      ingredientSet: pokemonInstance.ingredients.map(({ ingredient }) => ingredient.name),
      nrOfEvolutions
    }

    return await this.calculateSingleProduction(pokemonInstance.pokemon.name, request)
  }
}

export const ProductionService = new ProductionServiceImpl()
