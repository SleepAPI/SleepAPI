<template>
  <v-row>
    <v-col cols="12">
      <v-card class="bg-transparent rounded-t-0">
        <v-container>
          <v-row class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-h5">Weekly </span>
              <span id="weeklyStrength" class="text-h4 ml-2 text-strength font-weight-medium">
                {{ totalStrengthString }}</span
              >
              <v-img src="/images/misc/strength.png" class="ml-2" width="30" height="30" contain />
            </v-col>
          </v-row>

          <v-row dense class="flex-center">
            <v-col cols="auto" class="flex-center projected-rank">
              <v-img :src="rankBallImage" :alt="rankBallName" :title="rankBallName" width="36" height="36" contain />
              <span class="text-h6 text-no-wrap font-weight-medium ml-2">{{ projectedRank }}</span>
            </v-col>
          </v-row>

          <v-row dense class="flex-center">
            <v-col cols="auto" class="flex-center">
              <div class="legend" :class="`bg-${teamStore.getCurrentTeam.recipeType}`">
                <v-img :src="recipeTypeImage" contain width="32" height="32" alt="Cooking" title="Cooking" />
              </div>

              <span
                :class="[
                  'text-body-1',
                  `text-${teamStore.getCurrentTeam.recipeType}`,
                  'w-100',
                  'text-center',
                  'font-weight-medium',
                  'ml-2'
                ]"
              >
                {{ cookingStrengthString }}</span
              >
            </v-col>

            <v-col cols="auto" class="flex-center">
              <div class="legend bg-berry">
                <v-img src="/images/berries/berries.png" contain width="28" height="28" alt="Berries" title="Berries" />
              </div>
              <span class="text-body-1 text-berry w-100 text-center font-weight-medium ml-2">
                {{ berryStrengthString }}
              </span>
            </v-col>

            <v-col v-if="stockpiledBerryStrength > 0" cols="auto" class="flex-center">
              <div class="legend bg-berry-light">
                <v-img
                  style="filter: grayscale(100)"
                  src="/images/berries/berries.png"
                  contain
                  width="28"
                  height="28"
                  alt="Starting Berries"
                  title="Starting Berries"
                />
              </div>
              <span class="text-body-1 text-berry-light text-center font-weight-medium ml-2"> Starting Berries </span>
              <span class="text-body-1 text-berry-light text-center font-weight-medium ml-1">
                {{ stockpiledBerryStrengthString }}
              </span>
            </v-col>

            <v-col cols="auto" class="flex-center">
              <div class="legend bg-skill">
                <v-img src="/images/misc/skillproc.png" contain width="24" height="24" alt="Skills" title="Skills" />
              </div>
              <span class="text-body-1 text-skill text-center font-weight-medium ml-2">
                {{ skillStrengthString }}
              </span>
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="12" class="flex-center">
              <StackedBar
                id="memberBar"
                :style="[`height: ${isMobile ? '30' : '50'}px`]"
                :sections="[
                  {
                    color: teamStore.getCurrentTeam.recipeType,
                    percentage: cookingPercentage,
                    sectionText: `${cookingPercentage}%`,
                    tooltipText: `${compactNumber(cookingStrength)} (${cookingPercentage}%)`
                  },
                  {
                    color: 'berry',
                    percentage: berryPercentage,
                    sectionText: `${berryPercentage}%`,
                    tooltipText: `${compactNumber(berryStrength)} (${berryPercentage}%)`
                  },
                  {
                    color: 'berry-light',
                    percentage: stockpiledBerryPercentage,
                    sectionText: `${stockpiledBerryPercentage}%`,
                    tooltipText: `${compactNumber(stockpiledBerryStrength)} (${stockpiledBerryPercentage}%)`
                  },

                  {
                    color: 'skill',
                    percentage: skillPercentage,
                    sectionText: `${skillPercentage}%`,
                    tooltipText: `${compactNumber(skillStrength)} (${skillPercentage}%)`
                  }
                ]"
              />
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="10" class="flex-center my-2">
              <v-divider />
            </v-col>
          </v-row>

          <v-row v-for="(member, index) in memberPercentages" :key="index" no-gutters>
            <v-col cols="auto">
              <div class="pokemon-image-card-box">
                <v-card height="20px" elevation="0" class="bg-transparent text-center text-truncate pokemon-image-card">
                  {{ member.pokeName }}
                </v-card>
                <v-img height="60px" width="60px" class="pokemon-image-img" :src="member.image" cover></v-img>
              </div>
            </v-col>
            <v-col class="flex-center">
              <StackedBar
                :style="[`height: ${isMobile ? '25' : '36'}px`]"
                :sections="[
                  {
                    color: 'berry',
                    percentage: member.berryPercentage,
                    sectionText: member.berryValue,
                    tooltipText: `${member.berryValue} (${member.berryPercentage}%)`
                  },
                  {
                    color: 'skill',
                    percentage: member.skillPercentage,
                    sectionText: member.skillValue,
                    tooltipText: `${member.skillValue} (${member.skillPercentage}%)`
                  }
                ]"
              />
            </v-col>
          </v-row>

          <v-row v-if="stockpiledIngredientAmount > 0" dense class="flex-center">
            <v-col cols="auto" class="flex-center">
              <div class="">
                <v-img src="/images/ingredient/ingredients.png" contain :width="isMobile ? '28' : '40'" />
              </div>
              <span class="text-center ml-2">
                +{{ stockpiledIngredientAmount }}
                starting ingredients
              </span>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import StackedBar from '@/components/custom-components/stacked-bar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { pokemonImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { timeWindowFactor } from '@/types/time/time-window'
import {
  MathUtils,
  berryPowerForLevel,
  compactNumber,
  getBerry,
  getIsland,
  rankForProjectedStrength,
  type RecipeTypeResult
} from 'sleepapi-common'
export default defineComponent({
  name: 'TeamResults',
  components: { StackedBar },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    const { isMobile } = useBreakpoint()

    return { teamStore, pokemonStore, userStore, isMobile, weeklyFactor: timeWindowFactor('WEEK') }
  },
  computed: {
    currentRecipeTypeResult(): RecipeTypeResult | undefined {
      if (this.teamStore.getCurrentTeam.recipeType === 'curry') {
        return this.teamStore.getCurrentTeam.production?.team.cooking?.curry
      } else if (this.teamStore.getCurrentTeam.recipeType === 'salad') {
        return this.teamStore.getCurrentTeam.production?.team.cooking?.salad
      } else {
        return this.teamStore.getCurrentTeam.production?.team.cooking?.dessert
      }
    },
    cookingStrength() {
      return (
        (this.currentRecipeTypeResult?.weeklyStrength ?? 0) *
        this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
      )
    },
    berryStrength() {
      const members = this.teamStore.getCurrentTeam.production?.members ?? []
      return members.reduce((sum, member) => {
        return sum + Math.floor(member.strength.berries.total * this.weeklyFactor)
      }, 0)
    },
    skillStrength() {
      const members = this.teamStore.getCurrentTeam.production?.members ?? []
      return members.reduce((sum, memberProduction) => {
        return sum + Math.floor(memberProduction.strength.skill.total * this.weeklyFactor)
      }, 0)
    },
    stockpiledBerryStrength() {
      const island = this.teamStore.getCurrentTeam.island
      const islandBonus = this.userStore.islandBonus(island.shortName)
      const favoredBerries = new Set(island.berries.map((berry) => berry.name))

      const totalStrength = this.teamStore.getCurrentTeam.stockpiledBerries.reduce((sum, stockpiledBerry) => {
        const { amount, level, name } = stockpiledBerry
        const berry = getBerry(name)

        const baseStrength = amount * berryPowerForLevel(berry, level)
        const favoredMultiplier = favoredBerries.has(berry.name) ? 2 : 1

        return sum + baseStrength * favoredMultiplier * islandBonus
      }, 0)

      return Math.floor(totalStrength)
    },
    totalStrength() {
      return Math.floor(this.cookingStrength + this.berryStrength + this.skillStrength + this.stockpiledBerryStrength)
    },
    projectedRank() {
      const island = getIsland(this.teamStore.getCurrentTeam.island.shortName)
      return rankForProjectedStrength(this.totalStrength, island)
    },
    rankBallImage() {
      const rankName = this.projectedRank.split(' ')[0].toLowerCase()
      return `/images/misc/rank-${rankName}.png`
    },
    rankBallName() {
      const rankName = this.projectedRank.split(' ')[0]
      const ballNames: Record<string, string> = {
        Basic: 'Poké Ball',
        Great: 'Great Ball',
        Ultra: 'Ultra Ball',
        Master: 'Master Ball'
      }

      return ballNames[rankName]
    },
    cookingStrengthString() {
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(this.cookingStrength)
    },
    berryStrengthString() {
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(this.berryStrength)
    },
    skillStrengthString() {
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(this.skillStrength)
    },
    stockpiledBerryStrengthString() {
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(this.stockpiledBerryStrength)
    },
    totalStrengthString() {
      const userLocale = navigator.language || 'en-US'
      return new Intl.NumberFormat(userLocale, {
        maximumFractionDigits: 0
      }).format(this.totalStrength)
    },
    cookingPercentage() {
      const pct = MathUtils.floor((this.cookingStrength / this.totalStrength) * 100, 1)
      return isNaN(pct) ? 0 : pct
    },
    berryPercentage() {
      const pct = MathUtils.floor((this.berryStrength / this.totalStrength) * 100, 1)
      return isNaN(pct) ? 0 : pct
    },
    skillPercentage() {
      const pct = MathUtils.floor((this.skillStrength / this.totalStrength) * 100, 1)
      return isNaN(pct) ? 0 : pct
    },
    stockpiledBerryPercentage() {
      const pct = MathUtils.floor((this.stockpiledBerryStrength / this.totalStrength) * 100, 1)
      return isNaN(pct) ? 0 : pct
    },
    recipeTypeImage() {
      return this.teamStore.getCurrentTeam.recipeType === 'dessert'
        ? '/images/recipe/mixedjuice.png'
        : `/images/recipe/mixed${this.teamStore.getCurrentTeam.recipeType}.png`
    },
    memberPercentages() {
      const memberStrengths = []
      for (const memberProduction of this.teamStore.getCurrentTeam.production?.members ?? []) {
        const member = this.pokemonStore.getPokemon(memberProduction.externalId)
        if (!member) continue
        const berryStrength = Math.floor(memberProduction.strength.berries.total * this.weeklyFactor)
        const skillStrength = Math.floor(memberProduction.strength.skill.total * this.weeklyFactor)

        memberStrengths.push({
          berryStrength,
          skillStrength,
          berryValue: compactNumber(berryStrength),
          skillValue: compactNumber(skillStrength),
          image: pokemonImage({ pokemonName: member.pokemon.name, shiny: member.shiny }),
          name: member.name
        })
      }

      const result = memberStrengths.sort(
        (a, b) => b.skillStrength + b.berryStrength - (a.skillStrength + a.berryStrength)
      )
      const highestTotal = memberStrengths.at(0)
        ? memberStrengths[0].berryStrength + memberStrengths[0].skillStrength
        : 0
      return result.map((member) => ({
        berryPercentage: MathUtils.round((member.berryStrength / highestTotal) * 100, 1),
        skillPercentage: MathUtils.round((member.skillStrength / highestTotal) * 100, 1),
        berryValue: member.berryValue,
        skillValue: member.skillValue,
        image: member.image,
        pokeName: member.name
      }))
    },
    stockpiledIngredientAmount() {
      return this.teamStore.getCurrentTeam.stockpiledIngredients.reduce((sum, cur) => sum + Number(cur.amount), 0)
    }
  },
  methods: {
    compactNumber(num: number) {
      return compactNumber(num)
    }
  }
})
</script>

<style lang="scss">
.pokemon-image-card-box {
  overflow: hidden;
  width: 100px;
  height: 60px;
}

.pokemon-image-card {
  transform: translateY(40px);
  white-space: nowrap;
}

.pokemon-image-img {
  transform: translate(20px, -25px);
}

.projected-rank {
  min-width: 140px;
}
</style>
