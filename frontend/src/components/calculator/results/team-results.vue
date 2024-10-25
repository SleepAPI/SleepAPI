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

          <v-row dense class="flex-center totals-row">
            <v-col cols="auto" class="flex-center">
              <div class="legend bg-berry">
                <v-img src="/images/misc/berries-icon-alt.png" contain width="30" height="30" />
              </div>
              <span class="text-body-1 text-berry text-center font-weight-medium ml-2">
                {{ berryStrengthString }}</span
              >
            </v-col>

            <v-col cols="auto" class="flex-center">
              <div class="legend bg-skill">
                <v-img src="/images/misc/skillproc.png" contain width="24" height="24" />
              </div>
              <span class="text-body-1 text-skill text-center font-weight-medium ml-2">
                {{ skillStrengthString }}</span
              >
            </v-col>

            <v-col cols="auto" class="flex-center">
              <div class="legend" :class="`bg-${teamStore.getCurrentTeam.recipeType}`">
                <v-img :src="recipeTypeImage" contain width="30" height="30" />
              </div>
              <span
                :class="[
                  'text-body-1',
                  `text-${teamStore.getCurrentTeam.recipeType}`,
                  'text-center',
                  'font-weight-medium',
                  'ml-2'
                ]"
              >
                {{ cookingStrengthString }}</span
              >
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="12" class="flex-center">
              <StackedBar
                id="memberBar"
                :style="[`height: ${isMobile ? '30' : '50'}px`]"
                :sections="[
                  {
                    color: 'berry',
                    percentage: berryPercentage,
                    sectionText: `${berryPercentage}%`,
                    tooltipText: `${compactNumber(berryStrength)} (${berryPercentage}%)`
                  },
                  {
                    color: 'skill',
                    percentage: skillPercentage,
                    sectionText: `${skillPercentage}%`,
                    tooltipText: `${compactNumber(skillStrength)} (${skillPercentage}%)`
                  },
                  {
                    color: teamStore.getCurrentTeam.recipeType,
                    percentage: cookingPercentage,
                    sectionText: `${cookingPercentage}%`,
                    tooltipText: `${compactNumber(cookingStrength)} (${cookingPercentage}%)`
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
              <v-img :src="`${member.image}`" contain :width="isMobile ? '40' : '72'" />
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
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import StackedBar from '@/components/custom-components/stacked-bar.vue'
import { useViewport } from '@/composables/viewport-composable'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import {
  MathUtils,
  Strength,
  berryPowerForLevel,
  compactNumber,
  isSkillOrStockpileOf,
  type RecipeTypeResult
} from 'sleepapi-common'
export default defineComponent({
  name: 'TeamResults',
  components: { StackedBar },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    const { isMobile } = useViewport()

    return { teamStore, pokemonStore, userStore, isMobile }
  },
  data: () => ({ DAYS_IN_WEEK: 7 }),
  computed: {
    currentRecipeTypeResult(): RecipeTypeResult | undefined {
      if (this.teamStore.getCurrentTeam.recipeType === 'curry') {
        return this.teamStore.getCurrentTeam.production?.team.cooking.curry
      } else if (this.teamStore.getCurrentTeam.recipeType === 'salad') {
        return this.teamStore.getCurrentTeam.production?.team.cooking.salad
      } else {
        return this.teamStore.getCurrentTeam.production?.team.cooking.dessert
      }
    },
    cookingStrength() {
      return (this.currentRecipeTypeResult?.weeklyStrength ?? 0) * this.userStore.islandBonus
    },
    berryStrength() {
      const members = this.teamStore.getCurrentTeam.production?.members || []
      const favoredBerries = this.teamStore.getCurrentTeam.favoredBerries || []

      return members.reduce((sum, member) => {
        const { berries, member: memberInfo } = member

        if (!berries) {
          return sum
        }

        const berryPower = berryPowerForLevel(berries.berry, memberInfo.level)
        const isFavoredBerry = favoredBerries.some((b) => b.name === berries.berry.name)
        const berryMultiplier = isFavoredBerry ? 2 : 1
        const berryStrength =
          berries.amount *
          berryPower *
          berryMultiplier *
          this.userStore.islandBonus *
          this.DAYS_IN_WEEK

        return sum + berryStrength
      }, 0)
    },
    skillStrength() {
      const members = this.teamStore.getCurrentTeam.production?.members || []

      return members.reduce((sum, member) => {
        const { pokemon } = member.member
        const isStrengthUnit = isSkillOrStockpileOf(pokemon.skill, Strength)
        const skillAmount = isStrengthUnit ? member.skillAmount : 0

        const memberSkillStrength = isStrengthUnit
          ? skillAmount * this.userStore.islandBonus * this.DAYS_IN_WEEK
          : 0

        return sum + memberSkillStrength
      }, 0)
    },

    totalStrength() {
      return Math.floor(this.cookingStrength + this.berryStrength + this.skillStrength)
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
    recipeTypeImage() {
      return this.teamStore.getCurrentTeam.recipeType === 'dessert'
        ? '/images/recipe/mixedjuice.png'
        : `/images/recipe/mixed${this.teamStore.getCurrentTeam.recipeType}.png`
    },
    memberPercentages() {
      const memberStrengths = []
      for (const member of this.teamStore.getCurrentTeam.production?.members ?? []) {
        const { berries, skillProcs } = member
        const { pokemon, skillLevel } = member.member

        const isFavoredBerry = this.teamStore.getCurrentTeam.favoredBerries.some(
          (b) => b.name === berries?.berry.name
        )
        const berryMultiplier = isFavoredBerry ? 2 : 1
        const berryStrength = berries
          ? berries.amount *
            berryPowerForLevel(berries.berry, member.member.level) *
            berryMultiplier *
            this.userStore.islandBonus *
            this.DAYS_IN_WEEK
          : 0

        const isStrengthUnit = isSkillOrStockpileOf(pokemon.skill, Strength)
        const skillAmount = isStrengthUnit ? pokemon.skill.amount[skillLevel - 1] : 0
        const skillStrength = isStrengthUnit
          ? skillProcs * skillAmount * this.userStore.islandBonus * this.DAYS_IN_WEEK
          : 0

        memberStrengths.push({
          berryStrength,
          skillStrength,
          berryValue: compactNumber(berryStrength),
          skillValue: compactNumber(skillStrength),
          image: `/images/pokemon/${member.member.pokemon.name.toLowerCase()}${member.member.shiny ? '_shiny' : ''}.png`
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
        image: member.image
      }))
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
@import '@/assets/main.scss';

.legend {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 30px;
  border-radius: 30px;
}
</style>
