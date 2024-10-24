<template>
  <v-window v-model="teamStore.getCurrentTeam.memberIndex" continuous show-arrows class="mb-4">
    <template #prev="{ props }">
      <v-btn
        v-if="teamStore.getTeamSize > 1"
        id="prevMember"
        color="secondary"
        height="140"
        :width="isMobile ? 24 : 48"
        rounded="0"
        icon="mdi-chevron-left"
        style="position: absolute; top: 0px; left: 0px"
        @click="props.onClick"
      ></v-btn>
    </template>
    <template #next="{ props }">
      <v-btn
        v-if="teamStore.getTeamSize > 1"
        id="nextMember"
        color="secondary"
        height="140"
        :width="isMobile ? 24 : 48"
        rounded="0"
        icon="mdi-chevron-right"
        style="position: absolute; top: 0px; right: 0px"
        @click="props.onClick"
      ></v-btn>
    </template>
    <v-window-item v-for="(member, index) in members" :key="index">
      <v-row
        no-gutters
        class="flex-nowrap bg-surface"
        :style="{
          backgroundImage: `url(${islandImage({ favoredBerries: teamStore.getCurrentTeam.favoredBerries, background: true })})`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom'
        }"
      >
        <div
          id="chartContainer"
          class="frosted-glass-dark"
          :style="{
            clipPath: chartClipPath,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '140px'
          }"
        ></div>

        <v-col
          class="flex-left chart-container-triangle"
          :style="{
            maxWidth: '50%',
            height: '140px',
            left: teamStore.getTeamSize > 1 ? '20px' : '',
            position: 'relative'
          }"
        >
          <RadarChart
            v-if="member.singleProduction"
            :chart-data="ivData"
            :chart-options="ivOptions"
          />
          <v-col v-else class="flex-center pa-0">
            <v-skeleton-loader
              height="130px"
              width="130px"
              class="triangle-skeleton"
            ></v-skeleton-loader>
          </v-col>
        </v-col>

        <v-col v-if="!isMobile" cols="auto" class="flex-right mr-3" style="max-height: 140px">
          <SpeechBubble :pokemon-instance="member.member">
            <template #header-text>
              <v-row no-gutters class="flex-start flex-nowrap">
                <v-col cols="auto" class="mx-1">
                  <span class="text-surface text-left">Lv.{{ member.member.level }}</span>
                </v-col>
                <v-col>
                  <span class="text-primary text-left font-weight-medium">{{
                    member.member.name
                  }}</span>
                </v-col>
              </v-row>
            </template>
            <template #body-text>
              <div style="width: 200px; height: 75px">
                <span class="text-black text-left font-weight-light text-break">
                  {{ randomPhrase }}
                </span>
              </div>
            </template>
          </SpeechBubble>
        </v-col>

        <v-col class="flex-left" style="max-height: 140px; display: inline-block">
          <v-img
            :src="getMemberImage(member.member.pokemon.name, member.member.shiny)"
            height="140"
            width="140"
            style="
              filter: drop-shadow(0.5px 0.5px 0 black) drop-shadow(-0.5px 0.5px 0 black)
                drop-shadow(0.5px -0.5px 0 black) drop-shadow(-0.5px -0.5px 0 black);
            "
          ></v-img>
        </v-col>
      </v-row>

      <v-row dense class="flex-nowrap flex-center">
        <v-col v-for="(subskill, i) in member.member.subskills" :key="i">
          <v-card
            :color="rarityColor(subskill.subskill)"
            height="20px"
            :style="subskill.level > member.member.level ? 'opacity: 40%' : ''"
            class="text-body-2 text-center"
          >
            {{ isMobile ? subskill.subskill.shortName : subskill.subskill.name }}
          </v-card>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="6" class="flex-center w-100 px-2">
          <v-btn-toggle
            v-model="teamStore.timeWindow"
            style="height: 32px; width: 100%; max-width: 300px"
            mandatory
            color="primary"
            rounded="xl"
            base-color="surface"
          >
            <v-btn value="8H" style="width: 50%">8H</v-btn>
            <v-btn value="24H" style="width: 50%">24H</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col
          :class="[
            member.member.nature.positiveModifier === 'neutral' ? 'flex-center' : 'flex-right'
          ]"
        >
          <v-card
            class="w-100 text-center flex-center"
            height="32px"
            style="max-width: 150px"
            rounded="pill"
            elevation="0"
            >{{ member.member.nature.name }}</v-card
          >
        </v-col>
        <v-col v-if="!member.member.nature.prettyName.includes('neutral')" class="flex-left">
          <NatureModifiers :nature="member.member.nature" :short="true" />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col class="px-4">
          <v-card color="surface" rounded="xl">
            <v-row class="flex-center flex-nowrap mx-2 my-1">
              <!-- Berries -->
              <v-col cols="4" class="flex-center flex-column">
                <v-row dense class="flex-center">
                  <v-col cols="12" class="flex-center text-h6 text-berry font-weight-medium py-0">
                    Berry
                  </v-col>
                </v-row>

                <v-row dense justify="center">
                  <v-col cols="6" class="flex-center flex-column pt-0">
                    <v-img
                      :src="`/images/berries/${member.member.pokemon.berry.name.toLowerCase()}.png`"
                      height="24"
                      width="24"
                    ></v-img>
                    <span class="font-weight-medium text-center">{{
                      round((member.berries?.amount ?? 0) / teamStore.timewindowDivider)
                    }}</span>
                  </v-col>
                  <v-col cols="6" class="flex-center flex-column pt-0">
                    <v-img src="/images/misc/strength.png" height="16px" width="16px"></v-img>
                    <span class="font-weight-medium text-center">{{ currentBerryStrength }}</span>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Ingredients -->
              <v-col cols="4" class="flex-center flex-column">
                <v-row dense class="flex-center">
                  <v-col
                    cols="12"
                    class="flex-center text-h6 text-ingredient font-weight-medium py-0"
                  >
                    Ingredient
                  </v-col>
                </v-row>

                <v-row dense justify="center">
                  <v-col
                    v-for="({ amount, name }, i) in member.ingredients"
                    :key="i"
                    class="flex-center pt-0"
                  >
                    <div class="flex-center flex-column">
                      <v-img :src="name" height="24" width="24"></v-img>
                      <span class="text-center font-weight-medium">{{
                        round(amount / teamStore.timewindowDivider)
                      }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Skills -->
              <v-col cols="4" class="flex-center flex-column">
                <v-row dense class="flex-center">
                  <v-col cols="12" class="flex-center text-h6 text-skill font-weight-medium py-0">
                    Skill
                  </v-col>
                </v-row>

                <v-row dense justify="center" class="flex-nowrap">
                  <v-col class="flex-center flex-column pt-0">
                    <v-img src="/images/misc/skillproc.png" height="24" width="24"></v-img>
                    <span class="font-weight-medium text-center">{{
                      round(member.skillProcs / teamStore.timewindowDivider)
                    }}</span>
                  </v-col>
                  <v-col
                    v-if="member.member.pokemon.skill.unit !== 'metronome'"
                    class="flex-center flex-column pt-0"
                  >
                    <v-badge
                      id="skillLevelBadge"
                      :content="`Lv.${member.member.skillLevel}`"
                      location="top right"
                      offset-x="10"
                      offset-y="-2"
                      color="subskillWhite"
                      rounded="pill"
                    >
                      <v-img
                        :src="mainskillImage(member.member.pokemon)"
                        height="24px"
                        width="24px"
                      ></v-img>
                    </v-badge>
                    <span class="font-weight-medium text-center">{{ currentSkillValue }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col class="pr-6" style="min-width: 200px">
          <v-row dense class="flex-center flex-nowrap">
            <v-col cols="6" class="flex-center flex-column">
              <span class="text-h6 text-accent">Stats</span>
              <v-col cols="12" class="flex-left pt-0">
                <v-divider />
              </v-col>
              <span>Some stat</span>
              <span>Other stat</span>
              <span>Other stat</span>
              <span>Other stat</span>
            </v-col>
            <v-col cols="6" class="flex-center flex-column">
              <span class="text-h6 text-accent text-no-wrap">Team impact</span>
              <v-col cols="12" class="flex-left pt-0">
                <v-divider />
              </v-col>
              <span>Some stat</span>
              <span>Other stat</span>
              <span>Other stat</span>
              <span>Other stat</span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import {
  ivData,
  ivOptions,
  ivTextPlugin
} from '@/components/calculator/results/chart-data/iv-chart'
import RadarChart from '@/components/custom-components/charts/radar-chart.vue'
import NatureModifiers from '@/components/pokemon-input/nature-modifiers.vue'
import SpeechBubble from '@/components/speech-bubble/speech-bubble.vue'
import { useRandomPhrase } from '@/composables/use-random-phrase/use-random-phrase'
import { useViewport } from '@/composables/viewport-composable'
import { ProductionService } from '@/services/production/production-service'
import { rarityColor } from '@/services/utils/color-utils'
import { islandImage, mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type {
  PerformanceAnalysis,
  PerformanceDetails,
  SingleMemberProduction
} from '@/types/member/instanced'
import { Chart } from 'chart.js'
import {
  DreamShards,
  MathUtils,
  Strength,
  berryPowerForLevel,
  compactNumber,
  ingredient,
  isSkillOrStockpileOf,
  type DetailedProduce,
  type IngredientSet,
  type SingleProductionResponse
} from 'sleepapi-common'
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watchEffect
} from 'vue'

Chart.register(ivTextPlugin)

export default defineComponent({
  name: 'MemberResults',
  components: {
    RadarChart,
    NatureModifiers,
    SpeechBubble
  },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    const chartClipPath = ref('polygon(0% -10%, 50% -10%, 150% 100%, 0% 100%)')
    const { isMobile } = useViewport()
    const currentMember = computed(() => {
      return (
        teamStore.getCurrentTeam.production?.members[teamStore.getCurrentTeam.memberIndex] ?? null
      )
    })

    const { randomPhrase, getRandomPhrase } = useRandomPhrase()

    watchEffect(() => {
      if (currentMember.value && currentMember.value.member && currentMember.value.member.nature) {
        getRandomPhrase(currentMember.value.member.nature)
      }
    })

    let refreshInterval: number | null = null
    onMounted(() => {
      refreshInterval = window.setInterval(() => {
        if (
          currentMember.value &&
          currentMember.value.member &&
          currentMember.value.member.nature
        ) {
          getRandomPhrase(currentMember.value.member.nature)
        }
      }, 60000)

      updateClipPath()
      window.addEventListener('resize', updateClipPath)
    })

    onBeforeUnmount(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      window.removeEventListener('resize', updateClipPath)
    })

    const updateClipPath = () => {
      nextTick(() => {
        const chartContainer = document.getElementById('chartContainer') as HTMLElement
        if (chartContainer) {
          const height = chartContainer.offsetHeight
          const width = chartContainer.offsetWidth

          // on thin mobile the cut can overlap with chart numbers
          const factor = width < 400 ? 0.6 : 0.5

          const startingWidth = width * factor - height / Math.sqrt(3)
          const startingWidthPercentage = (startingWidth / width) * 100

          chartClipPath.value = `polygon(0% -1%, ${startingWidthPercentage}% -1%, ${factor * 100}% 101%, 0% 101%)`
        }
      })
    }

    onMounted(() => {
      updateClipPath()
      window.addEventListener('resize', updateClipPath)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateClipPath)
    })

    return {
      teamStore,
      pokemonStore,
      userStore,
      chartClipPath,
      isMobile,
      randomPhrase,
      mainskillImage,
      islandImage,
      rarityColor,
      ivData,
      ivOptions
    }
  },
  computed: {
    members() {
      const result = []
      for (const member of this.teamStore.getCurrentTeam.production?.members ?? []) {
        result.push({ ...member, ingredients: this.prepareMemberIngredients(member.ingredients) })
      }
      return result
    },
    currentMember() {
      return this.members[this.teamStore.getCurrentTeam.memberIndex]
    },
    currentMemberExternalId() {
      return this.currentMember?.member.externalId
    },
    currentMemberSingleProduction() {
      return this.currentMember?.singleProduction
    },
    currentBerryStrength() {
      const berries = this.members[this.teamStore.getCurrentTeam.memberIndex].berries
      if (!berries) {
        return 0
      }
      const favoredBerryMultiplier = this.teamStore.getCurrentTeam.favoredBerries.some(
        (berry) => berry.name === berries.berry.name
      )
        ? 2
        : 1

      const result = Math.floor(
        (berries.amount / this.teamStore.timewindowDivider) *
          berryPowerForLevel(
            berries.berry,
            this.members[this.teamStore.getCurrentTeam.memberIndex].member.level
          ) *
          this.userStore.islandBonus *
          favoredBerryMultiplier
      )

      return compactNumber(result)
    },
    currentSkillValue() {
      const memberProduction = this.members[this.teamStore.getCurrentTeam.memberIndex]
      if (!memberProduction) {
        return 0
      }
      const result =
        (memberProduction.skillAmount / this.teamStore.timewindowDivider) *
        this.userStore.islandBonus
      const skill = memberProduction.member.pokemon.skill
      const roundedResult =
        isSkillOrStockpileOf(skill, Strength) || isSkillOrStockpileOf(skill, DreamShards)
          ? Math.floor(result)
          : MathUtils.round(result, 1)

      return compactNumber(roundedResult)
    }
  },
  watch: {
    currentMemberSingleProduction: {
      immediate: true,
      async handler(newProduction?: SingleMemberProduction) {
        if (!newProduction) {
          await this.populateSingleProduction()
        } else {
          this.ivData = {
            ...this.ivData,
            datasets: [
              {
                ...this.ivData.datasets[0],
                data: [
                  newProduction.performanceAnalysis.user.skill ?? 0,
                  newProduction.performanceAnalysis.user.ingredient ?? 0,
                  newProduction.performanceAnalysis.user.berry ?? 0
                ]
              }
            ]
          }
        }
      }
    },
    currentMemberExternalId: {
      async handler() {
        if (!this.currentMember?.singleProduction) {
          await this.populateSingleProduction()
        }
      }
    }
  },
  methods: {
    getMemberImage(name: string, shiny: boolean) {
      return `/images/avatar/happy/${name.toLowerCase()}_happy${shiny ? '_shiny' : ''}.png`
    },
    prepareMemberIngredients(ingredients: IngredientSet[]) {
      if (ingredients.length >= ingredient.INGREDIENTS.length) {
        const ingMagnetAmount = ingredients.reduce(
          (min, cur) => (cur.amount < min ? cur.amount : min),
          ingredients[0].amount
        )

        const nonIngMagnetIngs = ingredients.filter((ing) => ing.amount !== ingMagnetAmount)

        const result = nonIngMagnetIngs.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount - ingMagnetAmount, 1),
          name: `/images/ingredient/${ingredient.name.toLowerCase()}.png`
        }))

        result.push({ amount: ingMagnetAmount, name: '/images/misc/ingredients.png' })
        return result
      } else {
        return ingredients.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount, 1),
          name: `/images/ingredient/${ingredient.name.toLowerCase()}.png`
        }))
      }
    },
    async populateSingleProduction() {
      const calculatedExternalId = this.teamStore.getCurrentMember
      if (!calculatedExternalId) {
        console.error(
          "Can't calculate single production for non-existing member, contact developer"
        )
        return
      }

      const response = await ProductionService.calculateTeamMemberProduction({
        teamIndex: this.teamStore.currentIndex,
        memberIndex: this.teamStore.getCurrentTeam.memberIndex
      })

      if (response) {
        const performanceAnalysis = this.parseMemberSingleProduction(response)
        if (performanceAnalysis && this.teamStore.getCurrentTeam.production) {
          const result = {
            summary: response.summary,
            detailedProduce: response.production.detailedProduce,
            performanceAnalysis
          }

          for (const member of this.teamStore.getCurrentTeam.production.members) {
            if (member.member.externalId === calculatedExternalId) {
              member.singleProduction = result
            }
          }
          return result
        }
      }
    },
    parseMemberSingleProduction(result: SingleProductionResponse): PerformanceAnalysis | undefined {
      const {
        neutralProduction: neutral,
        optimalBerryProduction: optimalBerry,
        optimalIngredientProduction: optimalIng,
        optimalSkillProduction: optimalSkill
      } = result
      const detailedProduce = result.production.detailedProduce

      if (!neutral || !optimalBerry || !optimalIng || !optimalSkill) {
        console.error(
          'Contact developer, missing neutral/optimal results in calculate single response'
        )
        return
      }

      const specialty = result.production.pokemonCombination.pokemon.specialty
      let optimalForSpecialty = optimalBerry
      if (specialty === 'ingredient') {
        optimalForSpecialty = optimalIng
      } else if (specialty === 'skill') {
        optimalForSpecialty = optimalSkill
      }

      const neutralPercentages: PerformanceDetails = this.calculatePercentagesOfSetup({
        current: neutral,
        optimalBerry,
        optimalIng,
        optimalSkill
      })
      const userPercentages: PerformanceDetails = this.calculatePercentagesOfSetup({
        current: detailedProduce,
        optimalBerry,
        optimalIng,
        optimalSkill
      })
      const optimalPercentages: PerformanceDetails = this.calculatePercentagesOfSetup({
        current: optimalForSpecialty,
        optimalBerry,
        optimalIng,
        optimalSkill
      })

      return { neutral: neutralPercentages, user: userPercentages, optimal: optimalPercentages }
    },
    calculatePercentagesOfSetup(params: {
      current: DetailedProduce
      optimalBerry: DetailedProduce
      optimalIng: DetailedProduce
      optimalSkill: DetailedProduce
    }): PerformanceDetails {
      const { current, optimalBerry, optimalIng, optimalSkill } = params
      return {
        berry: this.calculatePercentageOfOptimal({
          current: current.produce.berries?.amount ?? 0,
          optimalBerry: optimalBerry.produce.berries?.amount ?? 0,
          optimalIng: optimalIng.produce.berries?.amount ?? 0,
          optimalSkill: optimalSkill.produce.berries?.amount ?? 0
        }),
        ingredient: this.calculatePercentageOfOptimal({
          current: current.produce.ingredients[0].amount,
          optimalBerry: optimalBerry.produce.ingredients[0].amount,
          optimalIng: optimalIng.produce.ingredients[0].amount,
          optimalSkill: optimalSkill.produce.ingredients[0].amount
        }),
        ingredientsOfTotal: current.produce.ingredients.map(({ amount }) =>
          this.calculatePercentageOfOptimal({
            current: amount,
            optimalBerry: optimalBerry.produce.ingredients.reduce(
              (sum, cur) => sum + cur.amount,
              0
            ),
            optimalIng: optimalIng.produce.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalSkill: optimalSkill.produce.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
          })
        ),
        skill: this.calculatePercentageOfOptimal({
          current: current.averageTotalSkillProcs,
          optimalBerry: optimalBerry.averageTotalSkillProcs,
          optimalIng: optimalIng.averageTotalSkillProcs,
          optimalSkill: optimalSkill.averageTotalSkillProcs
        })
      }
    },

    calculatePercentageOfOptimal(params: {
      current: number
      optimalBerry: number
      optimalIng: number
      optimalSkill: number
    }) {
      const { current, optimalBerry, optimalIng, optimalSkill } = params
      return Math.round((current / Math.max(optimalBerry, optimalIng, optimalSkill)) * 100)
    },
    round(num: number) {
      return MathUtils.round(num, 1)
    }
  }
})
</script>

<style lang="scss">
.chart-container-triangle {
  transition: clip-path 0.3s ease;
}

.triangle-skeleton {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

#skillLevelBadge .v-badge__badge {
  max-height: 13px;
}
</style>
