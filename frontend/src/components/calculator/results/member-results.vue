<template>
  <v-card class="frosted-glass rounded-t-0">
    <v-window v-model="teamStore.getCurrentTeam.memberIndex" continuous show-arrows>
      <v-window-item v-for="(member, index) in members" :key="index" :value="index">
        <v-row no-gutters class="flex-nowrap bg-surface" style="position: relative">
          <div
            id="chartContainer"
            :style="{
              backgroundColor: `${chartBackground}`,
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
              width: '50%',
              maxWidth: '50%',
              height: '140px',
              position: 'relative'
            }"
          >
            <RadarChart
              v-if="member.singleProduction"
              :chart-data="radarData"
              :chart-options="radarOptions"
            />
            <v-col v-else class="flex-center pa-0">
              <v-skeleton-loader
                height="130px"
                width="130px"
                class="triangle-skeleton"
              ></v-skeleton-loader>
            </v-col>
          </v-col>

          <v-col
            class="flex-right"
            style="overflow: hidden; position: relative; width: 50%; max-width: 50%"
          >
            <!-- TODO: bring div back if we need to right align pokemon img -->
            <!-- <div style="display: inline-block"> -->
            <v-img
              :src="getMemberImage(member.member.pokemon.name, member.member.shiny)"
              height="140"
              width="140"
              style="
                filter: drop-shadow(0.5px 0.5px 0 black) drop-shadow(-0.5px 0.5px 0 black)
                  drop-shadow(0.5px -0.5px 0 black) drop-shadow(-0.5px -0.5px 0 black);
              "
            ></v-img>
            <!-- </div> -->
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
              {{ viewportWidth < 1200 ? subskill.subskill.shortName : subskill.subskill.name }}
            </v-card>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="6" class="flex-center w-100">
            <v-btn-toggle
              v-model="teamStore.timeWindow"
              style="height: 32px; width: 80%"
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
            <div>
              <div class="nowrap responsive-text">
                <span class="nowrap mr-1">{{
                  getModifiedStat(member.member.nature, 'positive')
                }}</span>
                <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
                <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
              </div>
              <div class="nowrap responsive-text">
                <span class="nowrap mr-1">{{
                  getModifiedStat(member.member.nature, 'negative')
                }}</span>
                <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
                <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row dense class="mb-4">
          <v-col cols="6">
            <v-card color="surface">
              <v-row dense class="flex-wrap flex-top py-2">
                <!-- Berries -->
                <v-col cols="12" md="4" class="flex-center flex-column pt-0">
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
                <v-col cols="12" md="4" class="flex-center flex-column pt-0">
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
                <v-col cols="12" md="4" class="flex-center flex-column pt-0">
                  <v-row dense class="flex-center">
                    <v-col cols="12" class="flex-center text-h6 text-skill font-weight-medium py-0">
                      Skill
                    </v-col>
                  </v-row>

                  <v-row dense justify="center">
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
                        :content="`Lv.${member.member.skillLevel}`"
                        location="top right"
                        offset-x="10"
                        offset-y="-2"
                        color="subskillWhite"
                        rounded="pill"
                      >
                        <v-img
                          :src="`/images/mainskill/${member.member.pokemon.skill.unit.toLowerCase()}.png`"
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
        </v-row>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts">
import RadarChart from '@/components/custom-components/charts/radar-chart.vue'
import { ProductionService } from '@/services/production/production-service'
import { hexToRgba } from '@/services/utils/color-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type {
  PerformanceAnalysis,
  PerformanceDetails,
  SingleMemberProduction
} from '@/types/member/instanced'
import { Chart, RadialLinearScale } from 'chart.js'
import {
  MathUtils,
  berryPowerForLevel,
  capitalize,
  ingredient,
  island,
  mainskill,
  nature,
  type DetailedProduce,
  type IngredientSet,
  type SingleProductionResponse,
  type subskill
} from 'sleepapi-common'
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const customPlugin = {
  id: 'customPlugin',
  afterDraw(chart: Chart) {
    const ctx = chart.ctx
    const scale = chart.scales.r as RadialLinearScale
    const data = chart.config.data.datasets[0].data as number[]
    const labels = chart.config.data.labels as string[]

    if (!chart) return

    ctx.save()
    ctx.textAlign = 'center'

    // Iterate over each label and data value to draw the percentage and label
    labels.forEach((label, index) => {
      const position = scale.getPointPosition(index, scale.max)
      const value = `${data[index]}%`

      ctx.font = 'bold 18px Chakra Petch'
      if (index === 0) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
          '--v-theme-skill'
        )
        ctx.fillText(value, position.x, position.y + 33)
        ctx.font = '10px Chakra Petch'
        ctx.fillText(label.toLowerCase(), position.x, position.y + 40)
      } else if (index === 1) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
          '--v-theme-ingredient'
        )
        ctx.fillText(value, position.x - 35, position.y - 7)
        ctx.font = '10px Chakra Petch'
        ctx.fillText(label.toLowerCase(), position.x - 35, position.y)
      } else if (index === 2) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
          '--v-theme-berry'
        )
        ctx.fillText(value, position.x + 30, position.y - 7)
        ctx.font = '10px Chakra Petch'
        ctx.fillText(label.toLowerCase(), position.x + 30, position.y)
      }
    })

    ctx.restore()
  }
}

Chart.register(customPlugin)

export default defineComponent({
  name: 'MemberResults',
  components: {
    RadarChart
  },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const chartClipPath = ref('polygon(0% 0%, 50% 0%, 150% 100%, 0% 100%)')

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

          chartClipPath.value = `polygon(0% 0%, ${startingWidthPercentage}% 0%, ${factor * 100}% 100%, 0% 100%)`
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

    return { teamStore, pokemonStore, chartClipPath }
  },
  data() {
    return {
      radarData: {
        labels: ['Skill', 'Ingredient', 'Berry'],
        datasets: [
          {
            data: [0, 0, 0],
            borderColor: '#888',
            backgroundColor: hexToRgba(
              getComputedStyle(document.documentElement).getPropertyValue(`--v-theme-secondary`),
              0.5
            ),
            pointBorderColor: [
              getComputedStyle(document.documentElement).getPropertyValue(`--v-theme-skill`),
              getComputedStyle(document.documentElement).getPropertyValue(`--v-theme-ingredient`),
              getComputedStyle(document.documentElement).getPropertyValue(`--v-theme-berry`)
            ]
          }
        ]
      },
      radarOptions: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,

            ticks: {
              stepSize: 100,
              backdropColor: 'rgba(0, 0, 0, 0)',
              callback(value: number) {
                if (value === 100) {
                  return ''
                }
                return value
              }
            },
            pointLabels: {
              display: false
            },
            grid: {
              color: '#fff',
              lineWidth: 1
            },
            angleLines: {
              color: '#fff',
              lineWidth: 1
            },
            afterFit(scale: any) {
              scale.yCenter += 10
            }
          }
        },
        elements: {
          line: {
            borderWidth: 2
          }
        },
        plugins: {
          legend: {
            display: false
          },
          customPlugin
        }
      }
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
    currentMemberSingleProduction() {
      const currentMember = this.members[this.teamStore.getCurrentTeam.memberIndex]
      return currentMember?.singleProduction
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

      return Math.floor(
        (berries.amount / this.teamStore.timewindowDivider) *
          berryPowerForLevel(
            berries.berry,
            this.members[this.teamStore.getCurrentTeam.memberIndex].member.level
          ) *
          favoredBerryMultiplier *
          favoredBerryMultiplier
      )
    },
    currentSkillValue() {
      const memberProduction = this.members[this.teamStore.getCurrentTeam.memberIndex]
      if (!memberProduction) {
        return 0
      }
      // TODO: different rounding for different skills
      const amount =
        memberProduction.member.pokemon.skill.amount[memberProduction.member.skillLevel - 1] *
        (memberProduction.member.pokemon.skill.name === mainskill.ENERGY_FOR_EVERYONE.name ? 5 : 1)

      return Math.floor(amount * (memberProduction.skillProcs / this.teamStore.timewindowDivider))
    },
    viewportWidth() {
      return window.innerWidth
    },
    chartBackground() {
      return hexToRgba(
        getComputedStyle(document.documentElement).getPropertyValue(`--v-theme-secondary`),
        0.8
      )
    },
    memberBackground() {
      const berryNames = this.teamStore.getCurrentTeam.favoredBerries.map((b) => b.name)

      const arraysEqual = (arr1: string[], arr2: string[]) => {
        if (arr1.length !== arr2.length) return false
        return arr1.every((value, index) => value === arr2[index])
      }

      const berryImageMap = {
        '/images/site/background-cyan.png': island.CYAN.berries,
        '/images/site/background-taupe.png': island.TAUPE.berries,
        '/images/site/background-snowdrop.png': island.SNOWDROP.berries,
        '/images/site/background-lapis.png': island.LAPIS.berries,
        '/images/site/background-powerplant.png': island.POWER_PLANT.berries
      }

      for (const [imagePath, islandberries] of Object.entries(berryImageMap)) {
        const berryArrayNames = islandberries.map((b) => b.name)
        if (arraysEqual(berryNames, berryArrayNames)) {
          return imagePath
        }
      }

      return '/images/site/background-greengrass.png'
    }
  },
  watch: {
    currentMemberSingleProduction: {
      immediate: true,
      async handler(newProduction?: SingleMemberProduction) {
        if (!newProduction) {
          const result = await this.populateSingleProduction()
          this.radarData.datasets[0].data = [
            result?.performanceAnalysis.user.skill ?? 0,
            result?.performanceAnalysis.user.ingredient ?? 0,
            result?.performanceAnalysis.user.berry ?? 0
          ]
        } else {
          this.radarData.datasets[0].data = [
            newProduction.performanceAnalysis.user.skill ?? 0,
            newProduction.performanceAnalysis.user.ingredient ?? 0,
            newProduction.performanceAnalysis.user.berry ?? 0
          ]
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
    rarityColor(subskill: subskill.SubSkill) {
      return `subskill${capitalize(subskill.rarity)}`
    },
    getModifiedStat(nature: nature.Nature, modifier: 'positive' | 'negative') {
      const modifiers: { [key: string]: { value: number; message: string } } = {
        frequency: { value: nature.frequency, message: 'Speed' },
        ingredient: { value: nature.ingredient, message: 'Ing' },
        skill: { value: nature.skill, message: 'Skill' },
        energy: { value: nature.energy, message: 'Energy' },
        exp: { value: nature.exp, message: 'EXP' }
      }

      for (const key in modifiers) {
        if (modifiers[key].value > 1 && modifier === 'positive') {
          return modifiers[key].message
        } else if (modifiers[key].value < 1 && modifier === 'negative') {
          return modifiers[key].message
        }
      }

      return ''
    },
    async populateSingleProduction() {
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
          this.teamStore.getCurrentTeam.production.members[
            this.teamStore.getCurrentTeam.memberIndex
          ].singleProduction = result
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
        ingredientsOfTotal: current.produce.ingredients.map(({ amount }, i) =>
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
@import '@/assets/main.scss';
.chart-container-triangle {
  transition: clip-path 0.3s ease;
}

.triangle-skeleton {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.v-badge__badge {
  max-height: 13px;
}

.v-window__left {
  position: absolute;
  left: 0px;
  top: 51px; // 75px - 24px which is half the header down and then half the button height up
  overflow: visible;
}

.v-window__right {
  position: absolute;
  right: 0px;
  top: 51px;
}
</style>
