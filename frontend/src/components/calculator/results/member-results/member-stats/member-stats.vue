<template>
  <v-row class="flex-center px-2">
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Stats </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>

  <v-row class="flex-column px-2" dense>
    <!-- RP  -->
    <v-col class="text-no-wrap">
      <span> <span class="text-primary font-weight-medium">RP</span> {{ rp }}</span>
    </v-col>

    <v-col class="text-no-wrap">
      <span> Level {{ level }}</span>
    </v-col>

    <v-col class="flex-center">
      <v-row dense>
        <v-col cols="auto">
          <span> Ingredient list </span>
        </v-col>
        <v-col v-for="(ingredientSet, index) in ingredientList" :key="index" cols="auto">
          <div class="flex-center">
            <span> {{ ingredientSet.amount }}</span>
            <v-img :src="ingredientImage(ingredientSet.ingredient.name)" height="24" width="24"></v-img>
          </div>
        </v-col>
      </v-row>
    </v-col>

    <!-- Carry limit -->
    <v-col :class="[{ 'flex-left': !isMobile }]">
      <span>
        Carry limit: <span class="font-weight-medium">{{ carrySize }} </span>
      </span>
      <div v-if="carryGainFromSubskills > 0 || carryGainFromRibbon > 0" class="ml-4 d-flex">
        <div v-if="carryGainFromSubskills > 0" class="text-small mr-4 flex-center">
          +{{ carryGainFromSubskills }} from subskills
        </div>
        <div v-if="carryGainFromRibbon > 0" class="text-small flex-center">
          +{{ carryGainFromRibbon }} from ribbon <v-img class="ribbon-image" :src="ribbonImage"></v-img>
        </div>
      </div>
    </v-col>

    <SkillDistribution :pokemonProduction="pokemonProduction" :class="['my-auto', { 'mx-auto': isMobile }]" />

    <v-row dense :class="[{ 'flex-wrap': isMobile }]">
      <!-- Day period -->
      <v-col>
        <v-card class="day-card d-flex justify-space-between h-100" prepend-avatar="/images/misc/day.png">
          <template #append>
            <v-row class="flex-column" no-gutters>
              <span> Average Frequency: {{ averageDayFrequency }} </span>
              <span> Average Energy: {{ averageDayEnergy }} </span>
            </v-row>
          </template>
        </v-card>
      </v-col>

      <!-- Night period -->
      <v-col>
        <v-card class="night-card" append-avatar="/images/misc/night.png">
          <template #prepend>
            <v-row class="flex-column" no-gutters>
              <span> Average Frequency: {{ averageNightFrequency }} </span>
              <span> Average Energy: {{ averageNightEnergy }} </span>
              <div v-if="spilledIngredients.length > 0">
                <v-row dense>
                  <v-col v-for="(ingredientSet, index) in spilledIngredients" :key="index" cols="auto">
                    <div class="flex-center">
                      <div class="text-center">
                        {{ MathUtils.round(ingredientSet.amount, 1) }}
                      </div>
                      <v-img :src="ingredientImage(ingredientSet.ingredient.name)" height="24" width="24"></v-img>
                    </div>
                  </v-col>
                  <v-col cols="auto"> spilled </v-col>
                </v-row>
              </div>
            </v-row>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-row>
</template>

<script lang="ts">
import SkillDistribution from '@/components/calculator/results/member-results/member-stats/skill-distribution.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { ingredientImage } from '@/services/utils/image-utils'
import { TimeUtils } from '@/services/utils/time-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { calculateRibbonCarrySize, calculateSubskillCarrySize, limitSubSkillsToLevel, MathUtils } from 'sleepapi-common'
import { computed, defineComponent, ref, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberStats',
  components: {
    SkillDistribution
  },
  props: {
    pokemonProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  setup(props: { pokemonProduction: MemberWithProduction }) {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const showSkillDistribution = ref(false)

    const rp = computed(() => props.pokemonProduction.member.rp)
    const level = computed(() => props.pokemonProduction.member.level)
    const ingredientList = computed(() => props.pokemonProduction.member.ingredients)
    const carrySize = computed(() => props.pokemonProduction.production.advanced.carrySize)
    const spilledIngredients = computed(
      () => props.pokemonProduction.production.advanced.nightPeriod?.spilledIngredients
    )

    const averageDayFrequency = computed(() => {
      return TimeUtils.prettifySeconds(props.pokemonProduction.production.advanced.dayPeriod?.averageFrequency)
    })
    const averageDayEnergy = computed(() =>
      MathUtils.round(props.pokemonProduction.production.advanced.dayPeriod?.averageEnergy, 1)
    )
    const averageNightFrequency = computed(() =>
      TimeUtils.prettifySeconds(props.pokemonProduction.production.advanced.nightPeriod?.averageFrequency)
    )
    const averageNightEnergy = computed(() =>
      MathUtils.round(props.pokemonProduction.production.advanced.nightPeriod?.averageEnergy, 1)
    )

    const { isMobile } = useBreakpoint()

    return {
      teamStore,
      pokemonStore,
      rp,
      level,
      ingredientList,
      carrySize,
      spilledIngredients,
      ingredientImage,
      MathUtils,
      showSkillDistribution,
      averageDayFrequency,
      averageDayEnergy,
      averageNightFrequency,
      averageNightEnergy,
      isMobile
    }
  },
  computed: {
    carryGainFromSubskills() {
      const subskills = new Set(this.pokemonProduction.member.subskills.map((s) => s.subskill.name))
      const activeSubskills = limitSubSkillsToLevel(subskills, this.pokemonProduction.member.level)

      return calculateSubskillCarrySize(activeSubskills)
    },
    carryGainFromRibbon() {
      return calculateRibbonCarrySize(this.pokemonProduction.member.ribbon)
    },
    ribbonImage() {
      const ribbonLevel = Math.max(this.pokemonProduction.member.ribbon, 1)
      return `/images/misc/ribbon${ribbonLevel}.png`
    }
  }
})
</script>

<style scoped lang="scss">
.day-card {
  background-color: rgba($day, 0.2);
}

.night-card {
  background-color: rgba($night, 0.2);
}

.ribbon-image {
  height: 24px;
  width: 24px;
  display: inline-flex;
  vertical-align: text-bottom;
}
</style>
