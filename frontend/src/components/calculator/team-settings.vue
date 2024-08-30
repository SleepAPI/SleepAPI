<template>
  <v-row dense>
    <v-col cols="6" class="d-flex align-center">
      Click a mon above to edit, save, duplicate or remove it.
    </v-col>
    <v-col cols="2" class="flex-center">
      <v-btn
        icon
        color="transparent"
        elevation="0"
        :class="{ nudge: teamStore.getTeamSize === 0 }"
        aria-label="delete team"
        @click="deleteTeam"
      >
        <v-avatar size="48">
          <v-icon
            size="36"
            :color="teamStore.getTeamSize === 0 ? 'secondary' : 'primary'"
            alt="delete team icon"
            >mdi-delete</v-icon
          >
        </v-avatar>
      </v-btn>
    </v-col>
    <v-col cols="2" class="flex-center">
      <v-btn
        :disabled="isCampButtonDisabled"
        icon
        color="transparent"
        elevation="0"
        @click="toggleCamp"
      >
        <v-avatar size="48">
          <v-img src="/images/misc/camp.png" :class="{ 'camp-disabled': !camp }" alt="camp icon" />
        </v-avatar>
      </v-btn>
    </v-col>
    <v-col cols="2" class="flex-center">
      <v-btn
        icon
        color="white"
        :disabled="isSleepScoreButtonDisabled"
        elevation="0"
        aria-label="sleep score"
        @click="openSleepMenu"
      >
        <v-avatar size="48">
          <v-progress-circular
            :model-value="sleepScore"
            :size="48"
            bg-color="#f0f0f0"
            color="#479EFF"
            :width="8"
            >{{ sleepScore }}</v-progress-circular
          >
        </v-avatar>
      </v-btn>
    </v-col>

    <v-dialog v-model="isTimePickerOpen" max-width="400px" aria-label="time menu">
      <v-card title="Update sleep" :subtitle="calculateSleepDuration">
        <template #append>
          <v-avatar size="48" color="white">
            <v-progress-circular
              :model-value="sleepScore"
              :size="48"
              bg-color="#f0f0f0"
              color="#479EFF"
              :width="8"
              >{{ sleepScore }}</v-progress-circular
            >
          </v-avatar>
        </template>

        <v-row class="flex-center">
          <v-col cols="10">
            <v-divider />
          </v-col>
        </v-row>

        <v-row>
          <v-col class="flex-center">
            <v-btn color="primary" aria-label="bedtime button" @click="isBedtimeOpen = true"
              >Bedtime: {{ bedtime }}</v-btn
            >
          </v-col>
          <v-col class="flex-center">
            <v-btn color="primary" aria-label="wakeup button" @click="isWakeupOpen = true"
              >Wakeup: {{ wakeup }}</v-btn
            >
          </v-col>
        </v-row>

        <v-card-actions class="pt-0">
          <v-btn rounded="lg" @click="isTimePickerOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isBedtimeOpen" aria-label="bedtime menu">
      <v-row class="flex-center">
        <v-col cols="auto">
          <v-card max-width="400px">
            <v-card-text class="pa-0 ma-0">
              <v-time-picker
                v-model="updatedBedtime"
                title="Select bedtime"
                color="primary"
                format="24hr"
                :allowed-hours="allowedBedtimeHours"
                :allowed-minutes="allowedStep"
                @update:model-value="toggleBedtimeMenu"
              ></v-time-picker>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="toggleBedtimeMenu">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-dialog>
    <v-dialog v-model="isWakeupOpen" aria-label="wakeup menu">
      <v-row class="flex-center">
        <v-col cols="auto">
          <v-card max-width="400px">
            <v-card-text class="pa-0 ma-0">
              <v-time-picker
                v-model="updatedWakeup"
                title="Select wakeup time"
                color="primary"
                format="24hr"
                :allowed-hours="allowedWakeupHours"
                :allowed-minutes="allowedStep"
                @update:model-value="toggleWakeupMenu"
              ></v-time-picker>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="toggleWakeupMenu">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { useTeamStore } from '@/stores/team/team-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSettings',
  setup() {
    const teamStore = useTeamStore()
    return { teamStore }
  },
  data: () => ({
    isCampButtonDisabled: false,
    isSleepScoreButtonDisabled: false,
    isTimePickerOpen: false,
    isWakeupOpen: false,
    isBedtimeOpen: false,
    wakeup: '06:00',
    bedtime: '21:30',
    updatedWakeup: null,
    updatedBedtime: null
  }),
  computed: {
    camp() {
      return this.teamStore.getCurrentTeam.camp
    },
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
  watch: {
    isTimePickerOpen(newValue) {
      if (newValue === false) {
        this.updateSleep()
      }
    }
  },
  mounted() {
    ;(this.bedtime = this.teamStore.getCurrentTeam.bedtime),
      (this.wakeup = this.teamStore.getCurrentTeam.wakeup)
  },
  methods: {
    async toggleCamp() {
      if (!this.isCampButtonDisabled) {
        this.isCampButtonDisabled = true
        await this.teamStore.toggleCamp()
        setTimeout(() => {
          this.isCampButtonDisabled = false
        }, 1000)
      }
    },
    openSleepMenu() {
      if (!this.isSleepScoreButtonDisabled) {
        this.isSleepScoreButtonDisabled = true
        this.isTimePickerOpen = true
        setTimeout(() => {
          this.isSleepScoreButtonDisabled = false
        }, 1000)
      }
    },
    toggleWakeupMenu() {
      this.isWakeupOpen = !this.isWakeupOpen
      if (this.updatedWakeup) {
        this.wakeup = this.updatedWakeup
        this.updatedWakeup = null
      }
    },
    toggleBedtimeMenu() {
      this.isBedtimeOpen = !this.isBedtimeOpen
      if (this.updatedBedtime) {
        this.bedtime = this.updatedBedtime
        this.updatedBedtime = null
      }
    },
    async updateSleep() {
      await this.teamStore.updateSleep({ bedtime: this.bedtime, wakeup: this.wakeup })
    },
    allowedStep(minute: number) {
      return minute % 5 === 0
    },
    allowedBedtimeHours(hour: number) {
      const wakeupHour = +this.wakeup.split(':')[0]
      return Math.abs(hour - wakeupHour) > 1
    },
    allowedWakeupHours(hour: number) {
      const wakeupHour = +this.bedtime.split(':')[0]
      return Math.abs(hour - wakeupHour) > 1
    },
    deleteTeam() {
      this.teamStore.deleteTeam()
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main';

.camp-disabled {
  filter: grayscale(100%);
}
</style>
