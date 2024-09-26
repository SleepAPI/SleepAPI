<template>
  <v-row>
    <v-col cols="12">
      <v-card class="frosted-glass rounded-t-0">
        <v-container>
          <v-row class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-h5">Weekly </span>
              <span id="weeklyStrength" class="text-h4 ml-2 text-accent font-weight-medium">
                {{ totalStrengthString }}</span
              >
              <v-img src="/images/misc/strength.png" class="ml-2" width="30" height="30" contain />
            </v-col>
          </v-row>

          <v-row dense class="flex-center">
            <v-col cols="auto" class="flex-center">
              <v-img src="/images/misc/berries.png" contain width="24" height="24" />
              <span class="text-body-1 text-berry w-100 text-center font-weight-medium ml-2">
                {{ berryStrengthString }}</span
              >
            </v-col>
            <v-col cols="auto" class="flex-center">
              <v-img src="/images/misc/skillproc.png" contain width="24" height="24" />
              <span class="text-body-1 text-skill w-100 text-center font-weight-medium">
                {{ skillStrengthString }}</span
              >
            </v-col>
            <v-col cols="auto" class="flex-center">
              <v-img :src="recipeTypeImage" contain width="30" height="30" />
              <span
                :class="[
                  'text-body-1',
                  `text-${teamStore.getCurrentTeam.recipeType}`,
                  'w-100',
                  'text-center',
                  'font-weight-medium'
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
                style="height: 30px"
                :sections="[
                  { color: 'berry', percentage: berryPercentage, text: `${berryPercentage}%` },
                  { color: 'skill', percentage: skillPercentage, text: `${skillPercentage}%` },
                  {
                    color: teamStore.getCurrentTeam.recipeType,
                    percentage: cookingPercentage,
                    text: `${cookingPercentage}%`
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

          <v-row v-for="(member, index) in memberPercentages" :key="index" dense>
            <v-col cols="auto">
              <v-img :src="`${member.image}`" contain width="36" height="36" />
            </v-col>
            <v-col class="flex-center">
              <StackedBar
                style="height: 25px"
                :sections="[
                  {
                    color: 'berry',
                    percentage: member.berryPercentage,
                    text: member.berryValue
                  },
                  {
                    color: 'skill',
                    percentage: member.skillPercentage,
                    text: member.skillValue
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
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import {
  MathUtils,
  berryPowerForLevel,
  compactNumber,
  type RecipeTypeResult
} from 'sleepapi-common'
export default defineComponent({
  name: 'TeamResults',
  components: { StackedBar },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    return { teamStore, pokemonStore, userStore }
  },
  data: () => ({ DAYS_IN_WEEK: 7 }), // TODO: currently lists everything in week result, needs to support toggle
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
        const { pokemon, skillLevel } = member.member
        const isStrengthUnit = pokemon.skill.unit === 'strength'
        const skillAmount = isStrengthUnit ? pokemon.skill.amount[skillLevel - 1] : 0

        const memberSkillStrength = isStrengthUnit
          ? member.skillProcs * skillAmount * this.userStore.islandBonus * this.DAYS_IN_WEEK
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
      const result: {
        total: string
        berryPercentage: number
        skillPercentage: number
        berryValue: string
        skillValue: string
        image: string
      }[] = []
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

        const isStrengthUnit = pokemon.skill.unit === 'strength'
        const skillAmount = isStrengthUnit ? pokemon.skill.amount[skillLevel - 1] : 0
        const skillStrength = isStrengthUnit
          ? skillProcs * skillAmount * this.userStore.islandBonus * this.DAYS_IN_WEEK
          : 0

        const userLocale = navigator.language || 'en-US'
        const total = new Intl.NumberFormat(userLocale, {
          maximumFractionDigits: 0
        }).format(Math.floor(berryStrength + skillStrength))
        result.push({
          total,
          berryPercentage: MathUtils.round(
            (berryStrength / (this.berryStrength + this.skillStrength)) * 100,
            1
          ),
          skillPercentage: MathUtils.round(
            (skillStrength / (this.berryStrength + this.skillStrength)) * 100,
            1
          ),
          berryValue: compactNumber(berryStrength),
          skillValue: compactNumber(skillStrength),
          image: `/images/pokemon/${member.member.pokemon.name.toLowerCase()}${member.member.shiny ? '_shiny' : ''}.png`
        })
      }
      return result.sort(
        (a, b) => b.skillPercentage + b.berryPercentage - (a.berryPercentage + a.skillPercentage)
      )
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>
