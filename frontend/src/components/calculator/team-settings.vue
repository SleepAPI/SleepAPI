<template>
  <v-row dense>
    <v-col cols="12/5" class="flex-center">
      <v-btn
        icon
        color="transparent"
        elevation="0"
        aria-label="select recipe"
        @click="openRecipeMenu"
      >
        <v-img height="48" width="48" :src="recipeTypeImage" alt="pot icon" class="recipe-color" />
      </v-btn>
    </v-col>
    <v-col cols="12/5" class="flex-center">
      <IslandSelect
        :previous-berries="teamStore.getCurrentTeam.favoredBerries"
        @favored-berries="updateFavoredBerries"
      />
    </v-col>

    <v-col cols="12/5" class="flex-center">
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
    <v-col cols="12/5" class="flex-center">
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
    <v-col cols="12/5" class="flex-center">
      <v-btn
        icon
        color="transparent"
        elevation="0"
        :class="{ nudge: teamStore.getTeamSize === 0 }"
        aria-label="delete team"
        @click="toggleDeleteMenu"
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

    <v-dialog
      v-model="recipeMenu"
      max-width="400px"
      aria-label="recipe menu"
      close-on-content-click
    >
      <v-card title="Choose recipe week" subtitle="Curry, salad or dessert">
        <template #append>
          <v-img width="48" height="48" src="/images/misc/pot1.png"></v-img>
        </template>
        <v-card
          class="flex-center"
          color="curry"
          height="72"
          aria-label="curry button"
          @click="teamStore.updateRecipeType('curry')"
        >
          <v-row class="flex-center">
            <v-col cols="6" class="w-100 text-h5 text-center flex-center"> Curry </v-col>
            <v-col cols="6" class="w-100 flex-center">
              <v-img width="72" height="72" src="/images/recipe/mixedcurry.png"></v-img>
            </v-col>
          </v-row>
        </v-card>

        <v-card
          class="flex-center"
          color="salad"
          height="72"
          aria-label="salad button"
          @click="teamStore.updateRecipeType('salad')"
        >
          <v-row class="flex-center">
            <v-col cols="6" class="w-100 text-h5 text-center flex-center"> Salad </v-col>
            <v-col cols="6" class="w-100 flex-center">
              <v-img width="72" height="72" src="/images/recipe/mixedsalad.png"></v-img>
            </v-col>
          </v-row>
        </v-card>

        <v-card
          class="flex-center"
          color="dessert"
          height="72"
          aria-label="dessert button"
          @click="teamStore.updateRecipeType('dessert')"
        >
          <v-row class="flex-center">
            <v-col cols="6" class="w-100 text-h5 text-center flex-center"> Dessert </v-col>
            <v-col cols="6" class="w-100 flex-center">
              <v-img width="72" height="72" src="/images/recipe/mixedjuice.png"></v-img>
            </v-col>
          </v-row>
        </v-card>

        <v-card-actions class="pt-0">
          <v-btn rounded="lg" @click="recipeMenu = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

    <v-dialog v-model="isDeleteOpen" aria-label="delete team menu">
      <v-row class="flex-center">
        <v-col cols="auto">
          <v-card max-width="400px">
            <v-card-title>Confirm delete team</v-card-title>
            <v-card-text>Do you really want to delete this team?</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="toggleDeleteMenu">Close</v-btn>
              <v-row>
                <v-btn color="surface" aria-label="close button" @click="toggleDeleteMenu"
                  >Close</v-btn
                >

                <v-btn color="primary" aria-label="delete button" @click="deleteTeam"
                  >Delete team</v-btn
                >
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import IslandSelect from '@/components/map/island-select.vue'
import { useTeamStore } from '@/stores/team/team-store'
import type { berry } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSettings',
  components: { IslandSelect },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore }
  },
  data: () => ({
    isCampButtonDisabled: false,
    isSleepScoreButtonDisabled: false,
    recipeMenu: false,
    isTimePickerOpen: false,
    isWakeupOpen: false,
    isBedtimeOpen: false,
    isDeleteOpen: false,
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
    },
    recipeTypeImage() {
      return this.teamStore.getCurrentTeam.recipeType === 'dessert'
        ? '/images/recipe/mixedjuice.png'
        : `/images/recipe/mixed${this.teamStore.getCurrentTeam.recipeType}.png`
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
    openRecipeMenu() {
      this.recipeMenu = true
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
    openDeleteMenu() {
      this.isDeleteOpen = true
    },
    toggleDeleteMenu() {
      this.isDeleteOpen = !this.isDeleteOpen
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
      this.toggleDeleteMenu()
      this.teamStore.deleteTeam()
    },
    updateFavoredBerries(berries: berry.Berry[]) {
      this.teamStore.getCurrentTeam.favoredBerries = berries
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
