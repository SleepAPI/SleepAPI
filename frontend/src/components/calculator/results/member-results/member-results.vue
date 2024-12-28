<template>
  <v-window
    v-model="teamStore.getCurrentTeam.memberIndex"
    continuous
    show-arrows
    class="mb-4"
    style="min-height: 485px"
  >
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
    <v-window-item v-for="(memberWithProduction, index) in membersWithProduction" :key="index" style="height: 600px">
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
          <RadarChart v-if="memberWithProduction.iv" :chart-data="ivData" :chart-options="ivOptions" />
          <v-col v-else class="flex-center pa-0">
            <v-skeleton-loader height="130px" width="130px" class="triangle-skeleton"></v-skeleton-loader>
          </v-col>
        </v-col>

        <v-col v-if="!isMobile" cols="auto" class="flex-right mr-3" style="max-height: 140px">
          <SpeechBubble :pokemon-instance="memberWithProduction.member">
            <template #header-text>
              <v-row no-gutters class="flex-start flex-nowrap">
                <v-col cols="auto" class="mx-1">
                  <span class="text-surface text-left">Lv.{{ memberWithProduction.member.level }}</span>
                </v-col>
                <v-col>
                  <span class="text-primary text-left font-weight-medium">{{ memberWithProduction.member.name }}</span>
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
            :src="getMemberImage(memberWithProduction.member.pokemon.name, memberWithProduction.member.shiny)"
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
        <v-col v-for="(subskill, i) in memberWithProduction.member.subskills" :key="i">
          <v-card
            :color="rarityColor(subskill.subskill)"
            height="20px"
            :style="subskill.level > memberWithProduction.member.level ? 'opacity: 40%' : ''"
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
          :class="[memberWithProduction.member.nature.positiveModifier === 'neutral' ? 'flex-center' : 'flex-right']"
        >
          <v-card
            class="w-100 text-center flex-center"
            height="32px"
            style="max-width: 150px"
            rounded="pill"
            elevation="0"
            >{{ memberWithProduction.member.nature.name }}</v-card
          >
        </v-col>
        <v-col v-if="!memberWithProduction.member.nature.prettyName.includes('neutral')" class="flex-left">
          <NatureModifiers :nature="memberWithProduction.member.nature" :short="true" />
        </v-col>
      </v-row>

      <MemberProductionHeader :member="currentMemberWithProduction" />
      <v-row dense class="flex-top flex-nowrap">
        <v-col cols="6" class="flex-center flex-column">
          <span class="text-h6 text-accent">Details</span>
          <v-col cols="12" class="flex-left pt-0">
            <v-divider />
          </v-col>
          <span>Crit chance: {{ currentMemberWithProduction.member.pokemon.skill.critChance * 100 }}%</span>
          <span
            >Crits per day: {{ MathUtils.round(currentMemberWithProduction.production.advanced.skillCrits, 2) }}</span
          >
          <span
            >Crit {{ currentMemberWithProduction.member.pokemon.skill.unit }}:
            {{ Math.floor(currentMemberWithProduction.production.advanced.skillCritValue) }}
          </span>
          <span v-if="currentMemberWithProduction.production.advanced.wastedEnergy > 0">
            Wasted energy:
            {{ MathUtils.round(currentMemberWithProduction.production.advanced.wastedEnergy, 1) }}</span
          >
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
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import { ivData, ivOptions, ivTextPlugin } from '@/components/calculator/results/chart-data/iv-chart'
import MemberProductionHeader from '@/components/calculator/results/member-results/member-production-header.vue'
import RadarChart from '@/components/custom-components/charts/radar-chart.vue'
import NatureModifiers from '@/components/pokemon-input/nature-modifiers.vue'
import SpeechBubble from '@/components/speech-bubble/speech-bubble.vue'
import { useRandomPhrase } from '@/composables/use-random-phrase/use-random-phrase'
import { useViewport } from '@/composables/viewport-composable'
import { TeamService } from '@/services/team/team-service'
import { rarityColor } from '@/services/utils/color-utils'
import { avatarImage, berryImage, islandImage, mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { UnexpectedError } from '@/types/errors/unexpected-error'
import type { PerformanceDetails } from '@/types/member/instanced'
import { Chart } from 'chart.js'
import { MathUtils, type MemberProductionBase } from 'sleepapi-common'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'

Chart.register(ivTextPlugin)

export default defineComponent({
  name: 'MemberResults',
  components: {
    RadarChart,
    NatureModifiers,
    SpeechBubble,
    MemberProductionHeader
  },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    const chartClipPath = ref('polygon(0% -10%, 50% -10%, 150% 100%, 0% 100%)')
    const { isMobile } = useViewport()
    const currentMember = computed(() => {
      return teamStore.getCurrentTeam.production?.members[teamStore.getCurrentTeam.memberIndex] ?? null
    })

    const { randomPhrase, getRandomPhrase } = useRandomPhrase()

    watchEffect(() => {
      if (currentMember.value) {
        const pokemonInstance = pokemonStore.getPokemon(currentMember.value.externalId)
        if (pokemonInstance) {
          getRandomPhrase(pokemonInstance.nature)
        }
      }
    })

    let refreshInterval: number | null = null
    onMounted(() => {
      refreshInterval = window.setInterval(() => {
        if (currentMember.value) {
          const pokemonInstance = pokemonStore.getPokemon(currentMember.value.externalId)
          if (pokemonInstance) {
            getRandomPhrase(pokemonInstance.nature)
          }
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
      berryImage,
      rarityColor,
      ivData,
      ivOptions,
      MathUtils
    }
  },
  computed: {
    membersWithProduction() {
      const result = []
      for (const member of this.teamStore.getCurrentMembersWithProduction) {
        member && result.push(member)
      }
      return result
    },
    currentMemberWithProduction() {
      return this.membersWithProduction[this.teamStore.getCurrentTeam.memberIndex]
    },
    // used by watch to trigger recalc
    currentExternalId() {
      return this.currentMemberWithProduction?.member.externalId
    },
    // used by watch to trigger recalc
    currentMemberIv() {
      return this.currentMemberWithProduction?.iv
    }
  },
  watch: {
    currentMemberIv: {
      immediate: true,
      async handler(newIv?: PerformanceDetails) {
        if (!newIv) {
          if (this.teamStore.getCurrentMember && !this.teamStore.getMemberIvLoading(this.currentExternalId)) {
            await this.populateIv()
          }
        } else {
          this.updateIvChart(newIv)
        }
      }
    },
    currentExternalId: {
      async handler(externalId: string) {
        if (
          !this.currentMemberWithProduction?.iv &&
          this.teamStore.getCurrentMember &&
          !this.teamStore.getMemberIvLoading(externalId)
        ) {
          await this.populateIv()
        }
      }
    }
  },
  methods: {
    getMemberImage(pokemonName: string, shiny: boolean) {
      return avatarImage({ pokemonName, happy: true, shiny })
    },
    updateIvChart(performanceDetails: PerformanceDetails) {
      const { skill, ingredient, berry } = performanceDetails
      this.ivData = {
        ...this.ivData,
        datasets: [
          {
            ...this.ivData.datasets[0],
            data: [Math.min(skill, 100), Math.min(ingredient, 100), Math.min(berry, 100)]
          }
        ]
      }
    },
    async populateIv() {
      const calculatedExternalId = this.teamStore.getCurrentMember
      if (!calculatedExternalId) {
        throw new UnexpectedError("Can't calculate iv for non-existing member, contact developer")
      }
      this.teamStore.upsertIv(calculatedExternalId, undefined)

      const memberProduction = this.currentMemberWithProduction.production
      const response = await TeamService.calculateCurrentMemberIv()

      if (response) {
        const performanceDetails = this.calculatePercentagesOfSetup({
          ...response,
          current: memberProduction
        })

        this.teamStore.upsertIv(calculatedExternalId, performanceDetails)
      }
    },
    calculatePercentagesOfSetup(params: {
      current: MemberProductionBase
      optimalBerry: MemberProductionBase
      optimalIngredient: MemberProductionBase
      optimalSkill: MemberProductionBase
    }): PerformanceDetails {
      const { current, optimalBerry, optimalIngredient, optimalSkill } = params
      return {
        berry: this.calculatePercentageOfOptimal({
          current: current.produceTotal.berries.at(0)?.amount ?? 0,
          optimalBerry: optimalBerry.produceTotal.berries.at(0)?.amount ?? 0,
          optimalIng: optimalIngredient.produceTotal.berries.at(0)?.amount ?? 0,
          optimalSkill: optimalSkill.produceTotal.berries.at(0)?.amount ?? 0
        }),
        ingredient: this.calculatePercentageOfOptimal({
          current: current.produceTotal.ingredients[0].amount,
          optimalBerry: optimalBerry.produceTotal.ingredients[0].amount,
          optimalIng: optimalIngredient.produceTotal.ingredients[0].amount,
          optimalSkill: optimalSkill.produceTotal.ingredients[0].amount
        }),
        ingredientsOfTotal: current.produceTotal.ingredients.map(({ amount }) =>
          this.calculatePercentageOfOptimal({
            current: amount,
            optimalBerry: optimalBerry.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalIng: optimalIngredient.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalSkill: optimalSkill.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
          })
        ),
        skill: this.calculatePercentageOfOptimal({
          current: current.skillProcs,
          optimalBerry: optimalBerry.skillProcs,
          optimalIng: optimalIngredient.skillProcs,
          optimalSkill: optimalSkill.skillProcs
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
