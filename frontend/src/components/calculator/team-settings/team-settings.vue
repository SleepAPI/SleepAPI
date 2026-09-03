<template>
  <v-row dense>
    <v-col cols="12/5" class="flex-center">
      <v-btn icon color="transparent" elevation="0" aria-label="select recipe" @click="openRecipeMenu">
        <v-img height="48" width="48" :src="recipeTypeImage" alt="pot icon" class="recipe-color" />
      </v-btn>
    </v-col>
    <v-col cols="12/5" class="flex-center">
      <IslandSelect :previous-island="teamStore.getCurrentTeam.island" @update-island="updateIsland" />
    </v-col>

    <v-col cols="12/5" class="flex-center">
      <v-btn :disabled="isCampButtonDisabled" icon color="transparent" elevation="0" @click="toggleCamp">
        <v-avatar size="48">
          <v-img
            src="/images/misc/camp.png"
            :class="{ 'camp-disabled': !camp }"
            alt="camp icon"
            data-testid="camp-image"
          />
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
            :model-value="sleepScore({ bedtime, wakeup })"
            :size="48"
            bg-color="#f0f0f0"
            color="#479EFF"
            :width="8"
            >{{ sleepScore({ bedtime, wakeup }) }}</v-progress-circular
          >
        </v-avatar>
      </v-btn>
    </v-col>

    <v-col cols="12/5" class="flex-center">
      <AdvancedSettings @save="updateStockpile" />
    </v-col>

    <v-dialog v-model="recipeMenu" max-width="400px" aria-label="recipe menu" close-on-content-click>
      <v-card title="Choose a recipe type">
        <template #append>
          <v-img width="48" height="48" src="/images/misc/pot1.png"></v-img>
        </template>
        <v-card
          class="flex-center meal-option"
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
          class="flex-center meal-option"
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
          class="flex-center meal-option"
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
      <v-card title="Update sleep" :subtitle="calculateSleepDuration({ bedtime, wakeup })">
        <template #append>
          <v-avatar size="48" color="white">
            <v-progress-circular
              :model-value="sleepScore({ bedtime, wakeup })"
              :size="48"
              bg-color="#f0f0f0"
              color="#479EFF"
              :width="8"
              >{{ sleepScore({ bedtime, wakeup }) }}</v-progress-circular
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
            <v-btn color="primary" aria-label="wakeup button" @click="isWakeupOpen = true">Wakeup: {{ wakeup }}</v-btn>
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
import AdvancedSettings from '@/components/calculator/team-settings/advanced-settings/advanced-settings.vue'
import IslandSelect from '@/components/map/island-select.vue'
import { TimeUtils } from '@/services/utils/time-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { BerrySetSimple, IngredientSetSimple, IslandInstance } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSettings',
  components: { IslandSelect, AdvancedSettings },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, sleepScore: TimeUtils.sleepScore, calculateSleepDuration: TimeUtils.calculateSleepDuration }
  },
  data: () => ({
    isCampButtonDisabled: false,
    isSleepScoreButtonDisabled: false,
    recipeMenu: false,
    isTimePickerOpen: false,
    isWakeupOpen: false,
    isBedtimeOpen: false,
    updatedWakeup: null,
    updatedBedtime: null
  }),
  computed: {
    camp() {
      return this.teamStore.getCurrentTeam.camp
    },
    bedtime() {
      return this.teamStore.getCurrentTeam.bedtime
    },
    wakeup() {
      return this.teamStore.getCurrentTeam.wakeup
    },
    recipeTypeImage() {
      return this.teamStore.getCurrentTeam.recipeType === 'dessert'
        ? '/images/recipe/mixedjuice.png'
        : `/images/recipe/mixed${this.teamStore.getCurrentTeam.recipeType}.png`
    }
  },
  watch: {
    isTimePickerOpen(newValue) {
      // only update server when the menu is closed
      if (newValue === false) {
        this.teamStore.updateSleep()
      }
    }
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
        this.teamStore.getCurrentTeam.wakeup = this.updatedWakeup
        this.updatedWakeup = null
      }
    },
    toggleBedtimeMenu() {
      this.isBedtimeOpen = !this.isBedtimeOpen
      if (this.updatedBedtime) {
        this.teamStore.getCurrentTeam.bedtime = this.updatedBedtime
        this.updatedBedtime = null
      }
    },
    async updateStockpile(params: { ingredients: IngredientSetSimple[]; berries: BerrySetSimple[] }) {
      await this.teamStore.updateStockpile(params)
    },
    allowedStep(minute: number) {
      return minute % 5 === 0 || minute === 59
    },
    allowedBedtimeHours(hour: number) {
      const wakeupHour = +this.wakeup.split(':')[0]
      return Math.abs(hour - wakeupHour) > 1
    },
    allowedWakeupHours(hour: number) {
      const bedtimeHour = +this.bedtime.split(':')[0]
      return Math.abs(hour - bedtimeHour) > 1
    },
    updateIsland(island: IslandInstance) {
      this.teamStore.updateIsland(island)
    }
  }
})
</script>

<style lang="scss">
.camp-disabled {
  filter: grayscale(100%);
}

.meal-option {
  border-radius: 8px;
  margin: 8px 24px;
}
</style>
