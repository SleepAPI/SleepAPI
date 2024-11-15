<template>
  <v-row class="flex-nowrap" dense>
    <v-col :class="[isMobile ? 'flex-left' : 'flex-right']">
      <v-menu v-model="teamMenu" offset-y :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn v-bind="props" append-icon="mdi-chevron-down" :class="isMobile ? 'w-100' : ''">
            <!-- TODO: would prefer not setting explicit max width -->
            <span
              class="text-body-2 text-truncate"
              :style="{ width: isMobile ? '40dvw' : '200px' }"
            >
              {{ comparisonStore.team?.name ?? 'No team selected' }}
            </span>
          </v-btn>
        </template>

        <v-card title="Select team" max-height="50dvh" style="overflow-y: auto">
          <template #append>
            <v-btn icon elevation="0" color="transparent" @click="comparisonStore.team = undefined">
              <v-icon color="primary">mdi-delete</v-icon>
            </v-btn>
          </template>
          <v-divider />

          <v-container class="font-weight-light text-body-2">
            <span>Selecting a team doesn't update previous calculations. </span>
            <span>Only allowing teams with maximum of 4 members. </span>
          </v-container>

          <v-divider />

          <v-list>
            <v-list-item
              v-for="(team, i) in teamStore.teams"
              :key="i"
              class="px-2"
              :variant="teamDisabled(team.members) ? 'tonal' : undefined"
              :disabled="teamDisabled(team.members)"
              @click="selectTeam(team)"
            >
              <v-row class="flex-center flex-nowrap" no-gutters>
                <v-col cols="4.1" class="text-body-2 text-truncate">
                  {{ team.name }}
                </v-col>
                <v-col v-for="(member, memberIndex) in team.members" :key="memberIndex" cols="auto">
                  <v-avatar>
                    <v-img :src="memberImage(member)"></v-img>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-col>

    <v-col cols="auto">
      <v-btn icon elevation="0" color="transparent" @click="comparisonStore.$reset()">
        <v-icon color="primary" size="36">mdi-delete</v-icon>
      </v-btn>
    </v-col>

    <v-col cols="auto">
      <div
        class="clock-container"
        @click="comparisonStore.timeWindow = comparisonStore.timeWindow === '8H' ? '24H' : '8H'"
      >
        <svg viewBox="0 0 48 48" class="clock-face">
          <circle
            v-for="i in 12"
            :key="i"
            :cx="24 + 21 * Math.cos(((i * 30 - 90) * Math.PI) / 180)"
            :cy="24 + 21 * Math.sin(((i * 30 - 90) * Math.PI) / 180)"
            r="1.5"
            fill="white"
          />
        </svg>
        <v-progress-circular
          :size="48"
          width="6"
          :model-value="comparisonStore.timeWindow === '8H' ? 40 : 100"
          color="primary"
        >
          <template #default>
            <span class="text-white font-weight-medium" style="z-index: 2">
              {{ comparisonStore.timeWindow }}
            </span>
          </template>
        </v-progress-circular>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { useViewport } from '@/composables/viewport-composable'
import { avatarImage } from '@/services/utils/image-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamInstance } from '@/types/member/instanced'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CompareSettings',
  setup() {
    const comparisonStore = useComparisonStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const { isMobile } = useViewport()
    return { comparisonStore, teamStore, pokemonStore, isMobile }
  },
  data: () => ({
    teamMenu: false,
    advancedMenu: false,
    tooltipMenu: false,
    isTimePickerOpen: false,
    isWakeupOpen: false,
    isBedtimeOpen: false,
    subskillsMenu: false,
    helpMenu: false,
    energyMenu: false,
    islandMenu: false,
    wakeup: '06:00',
    bedtime: '21:30',
    updatedWakeup: null,
    updatedBedtime: null
  }),
  computed: {
    sleepScore() {
      const [bedHour, bedMinute] = this.bedtime.split(':').map(Number)
      const [wakeHour, wakeMinute] = this.wakeup.split(':').map(Number)

      const bedTime = new Date()
      bedTime.setHours(bedHour, bedMinute, 0, 0)

      const wakeTime = new Date()
      wakeTime.setHours(wakeHour, wakeMinute, 0, 0)

      if (wakeTime <= bedTime) {
        wakeTime.setDate(wakeTime.getDate() + 1)
      }

      const durationInMinutes = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60) // Duration in minutes
      const maxDurationInMinutes = 8.5 * 60 // 8.5 hours in minutes

      const score = Math.floor(Math.min(100, (durationInMinutes / maxDurationInMinutes) * 100))
      return score
    },
    calculateSleepDuration(): string {
      const [bedHour, bedMinute] = this.bedtime.split(':').map(Number)
      const [wakeHour, wakeMinute] = this.wakeup.split(':').map(Number)

      const bedTime = new Date()
      bedTime.setHours(bedHour, bedMinute, 0, 0)

      const wakeTime = new Date()
      wakeTime.setHours(wakeHour, wakeMinute, 0, 0)

      if (wakeTime <= bedTime) {
        wakeTime.setDate(wakeTime.getDate() + 1)
      }

      const duration = (wakeTime.getTime() - bedTime.getTime()) / 1000 // Duration in seconds
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)

      return `${hours} hours and ${minutes} minutes`
    }
  },
  methods: {
    selectTeam(team: TeamInstance) {
      this.comparisonStore.team = team
      this.teamMenu = false
    },
    teamDisabled(members: (string | undefined)[]) {
      const count = members.filter(Boolean).length
      return count < 1 || count > 4
    },
    memberImage(externalId?: string) {
      if (externalId) {
        const pokemonInstance = this.pokemonStore.getPokemon(externalId)
        return (
          pokemonInstance &&
          avatarImage({
            pokemonName: pokemonInstance?.pokemon.name,
            happy: false,
            shiny: pokemonInstance?.shiny
          })
        )
      }
    }
  }
})
</script>

<style lang="scss">
.clock-container {
  position: relative;
}

.clock-face {
  position: absolute;
  z-index: 2;
}
</style>
