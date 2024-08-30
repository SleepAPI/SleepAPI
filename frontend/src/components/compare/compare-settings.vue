<template>
  <v-row dense>
    <v-col cols="8" class="flex-left">
      Changing settings does not update previous calculations
    </v-col>
    <v-col cols="2" class="flex-right">
      <v-btn
        icon
        color="transparent"
        elevation="0"
        aria-label="open advanced menu"
        @click="openAdvancedMenu"
      >
        <v-avatar>
          <v-icon size="24" alt="settings icon">mdi-cog</v-icon>
        </v-avatar>
      </v-btn>
    </v-col>
    <v-col cols="2" class="flex-center">
      <v-btn icon color="transparent" elevation="0" aria-label="delete team" @click="deleteTeam">
        <v-avatar size="48">
          <v-icon
            size="36"
            :color="comparisonStore.members.length === 0 ? 'secondary' : 'primary'"
            alt="delete team icon"
            >mdi-delete</v-icon
          >
        </v-avatar>
      </v-btn>
    </v-col>

    <v-dialog v-model="advancedMenu" max-width="500px" aria-label="advanced settings">
      <v-card>
        <v-container>
          <v-col cols="12" class="flex-center text-subtitle-1">
            Advanced settings

            <v-menu v-model="tooltipMenu" location="bottom">
              <template #activator="{ props }">
                <v-btn icon elevation="0" v-bind="props" aria-label="show tooltip">
                  <v-icon color="grey-lighten-1"> mdi-information </v-icon>
                </v-btn>
              </template>
              <v-card color="secondary">
                <v-col cols="12" class="flex-center text-body-2 text-center">
                  These are additional settings you can include with your calculation. You can use
                  these to simulate team members.
                </v-col>
                <v-col cols="12" class="flex-center text-body-2 text-center">
                  Randomized skills will be divided by 5 to simulate average chance. All skills are
                  using the max skill level.
                </v-col>
              </v-card>
            </v-menu>
          </v-col>

          <v-row class="flex-center">
            <v-col cols="10">
              <v-divider />
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="4" class="text-center responsive-text py-0"> Sleep time </v-col>
            <v-col cols="4" class="text-center responsive-text py-0"> Good camp </v-col>
            <v-col cols="4" class="text-center responsive-text py-0"> Recovery incense </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="4" class="flex-center">
              <v-btn
                icon
                color="white"
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
            <v-col cols="4" class="flex-center">
              <v-btn icon color="transparent" elevation="0" @click="comparisonStore.toggleCamp">
                <v-avatar size="48">
                  <v-img
                    src="/images/misc/camp.png"
                    :class="{ greyscale: !comparisonStore.camp }"
                    alt="camp icon"
                  />
                </v-avatar>
              </v-btn>
            </v-col>
            <v-col cols="4" class="flex-center">
              <v-btn
                icon
                color="transparent"
                elevation="0"
                @click="comparisonStore.toggleRecoveryIncense"
              >
                <v-avatar size="48">
                  <v-img
                    src="/images/misc/recovery-incense.png"
                    :class="{ greyscale: !comparisonStore.recoveryIncense }"
                    alt="recovery incense icon"
                  />
                </v-avatar>
              </v-btn>
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="10">
              <v-divider />
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="5" class="text-center responsive-text py-0"> Energy skills </v-col>
            <v-col cols="5" class="text-center responsive-text py-0"> Help skills </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="5" class="flex-center">
              <v-btn icon color="transparent" elevation="0" @click="openEnergyMenu">
                <v-avatar size="48">
                  <v-img src="/images/mainskill/energy.png" alt="recovery incense icon" />
                </v-avatar>
              </v-btn>
            </v-col>

            <v-col cols="5" class="flex-center">
              <v-btn icon color="transparent" elevation="0" @click="openHelpMenu">
                <v-avatar size="48">
                  <v-img src="/images/mainskill/helps.png" alt="recovery incense icon" />
                </v-avatar>
              </v-btn>
            </v-col>

            <v-col cols="10">
              <v-btn class="flex-center w-100" color="subskillGold" @click="openSubskillsMenu"
                >Team subskills</v-btn
              >
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="10">
              <v-divider />
            </v-col>
          </v-row>

          <v-col cols="12" class="flex-right">
            <v-btn color="secondary" @click="advancedMenu = false">Close</v-btn>
          </v-col>
        </v-container>
      </v-card>

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

      <v-dialog v-model="energyMenu" max-width="400px" aria-label="energy menu">
        <v-card title="Team energy skills" subtitle="Add your teammates' skill procs">
          <v-container>
            <span class="flex-center">Energy for everyone procs</span>
            <v-slider
              v-model="comparisonStore.e4e"
              min="0"
              max="10"
              show-ticks="always"
              :ticks="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              step="1"
              color="primary"
            ></v-slider>

            <span class="flex-center">Energizing cheer procs</span>
            <v-slider
              v-model="comparisonStore.cheer"
              min="0"
              max="10"
              show-ticks="always"
              :ticks="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              step="1"
              color="primary"
            ></v-slider>
          </v-container>

          <v-card-actions class="pt-0">
            <v-btn rounded="lg" @click="energyMenu = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="helpMenu" max-width="400px" aria-label="help menu">
        <v-card title="Team help skills" subtitle="Add your teammates' skill procs">
          <v-container>
            <span class="flex-center">Extra helpful procs</span>
            <v-slider
              v-model="comparisonStore.extraHelpful"
              min="0"
              max="10"
              show-ticks="always"
              :ticks="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              step="1"
              color="primary"
            ></v-slider>

            <span class="flex-center">Helper boost procs</span>
            <v-slider
              v-model="comparisonStore.helperBoost"
              min="0"
              max="10"
              show-ticks="always"
              :ticks="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              step="1"
              color="primary"
            ></v-slider>

            <span class="flex-center">Unique helper boost mons</span>
            <v-slider
              v-model="comparisonStore.helperBoostUnique"
              min="1"
              max="5"
              show-ticks="always"
              :ticks="[1, 2, 3, 4, 5]"
              step="1"
              color="primary"
            ></v-slider>
          </v-container>

          <v-card-actions class="pt-0">
            <v-btn rounded="lg" @click="helpMenu = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="subskillsMenu" max-width="400px" aria-label="subskills menu">
        <v-card title="Team subskills" subtitle="Set additional team subskills">
          <v-container>
            <span class="flex-center">Helping bonus</span>
            <v-slider
              v-model="comparisonStore.helpingBonus"
              min="0"
              max="4"
              show-ticks="always"
              :ticks="[0, 1, 2, 3, 4]"
              step="1"
              color="primary"
            ></v-slider>

            <span class="flex-center">Energy recovery bonus</span>
            <v-slider
              v-model="comparisonStore.erb"
              min="0"
              max="4"
              show-ticks="always"
              :ticks="[0, 1, 2, 3, 4]"
              step="1"
              color="primary"
            ></v-slider>
          </v-container>

          <v-card-actions class="pt-0">
            <v-btn rounded="lg" @click="subskillsMenu = false">Close</v-btn>
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
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CompareSettings',
  setup() {
    const comparisonStore = useComparisonStore()
    return { comparisonStore }
  },
  data: () => ({
    advancedMenu: false,
    tooltipMenu: false,
    isTimePickerOpen: false,
    isWakeupOpen: false,
    isBedtimeOpen: false,
    subskillsMenu: false,
    helpMenu: false,
    energyMenu: false,
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
  watch: {
    isTimePickerOpen(newValue) {
      if (newValue === false) {
        this.updateSleep()
      }
    }
  },
  mounted() {
    ;(this.bedtime = this.comparisonStore.bedtime), (this.wakeup = this.comparisonStore.wakeup)
  },
  methods: {
    openAdvancedMenu() {
      this.advancedMenu = true
    },
    openSleepMenu() {
      this.isTimePickerOpen = true
    },
    openSubskillsMenu() {
      this.subskillsMenu = true
    },
    openEnergyMenu() {
      this.energyMenu = true
    },
    openHelpMenu() {
      this.helpMenu = true
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
      await this.comparisonStore.updateSleep({ bedtime: this.bedtime, wakeup: this.wakeup })
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
      this.comparisonStore.$reset()

      this.wakeup = this.comparisonStore.wakeup
      this.bedtime = this.comparisonStore.bedtime
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main';

.greyscale {
  filter: grayscale(100%);
}
</style>
