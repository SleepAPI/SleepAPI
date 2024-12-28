<template>
  <v-dialog v-model="menu" max-width="500px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon color="transparent" elevation="0" v-bind="props">
        <v-img height="48" width="48" :src="islandImage({ favoredBerries, background: false })" alt="island icon" />
      </v-btn>
    </template>

    <v-card title="Select island or berries">
      <v-container>
        <v-row class="flex-center">
          <v-col class="flex-center">
            <v-btn icon color="transparent" size="64" aria-label="cyan island" @click="selectCyan">
              <v-avatar size="64">
                <v-img src="/images/island/cyan.png" alt="cyan icon" />
              </v-avatar>
            </v-btn>
          </v-col>
          <v-col class="flex-center">
            <v-btn icon color="transparent" size="64" aria-label="taupe island" @click="selectTaupe">
              <v-avatar size="64">
                <v-img src="/images/island/taupe.png" alt="taupe icon" />
              </v-avatar>
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col class="flex-center">
            <v-btn icon color="transparent" size="64" aria-label="snowdrop island" @click="selectSnowdrop">
              <v-avatar size="64">
                <v-img src="/images/island/snowdrop.png" alt="snowdrop icon" />
              </v-avatar>
            </v-btn>
          </v-col>
          <v-col class="flex-center">
            <v-btn icon color="transparent" size="64" aria-label="lapis island" @click="selectLapis">
              <v-avatar size="64">
                <v-img src="/images/island/lapis.png" alt="lapis icon" />
              </v-avatar>
            </v-btn>
          </v-col>
          <v-col class="flex-center">
            <v-btn icon color="transparent" size="64" aria-label="power plant island" @click="selectPowerPlant">
              <v-avatar size="64">
                <v-img src="/images/island/powerplant.png" alt="power plant icon" />
              </v-avatar>
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-sheet color="secondary" rounded style="overflow-y: auto">
              <v-chip-group v-model="favoredBerries" column multiple selected-class="bg-primary">
                <v-chip
                  v-for="berry in berries"
                  :key="berry.name"
                  :value="berry"
                  class="ma-1"
                  @click="toggleBerry(berry)"
                >
                  <v-avatar size="24">
                    <v-img :src="`/images/berries/${berry.name.toLowerCase()}.png`" />
                  </v-avatar>
                </v-chip>
              </v-chip-group>
            </v-sheet>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4" class="flex-left">
            <v-btn color="surface" aria-label="clear button" @click="clear()">Clear</v-btn>
          </v-col>
          <v-col cols="4" class="flex-center">
            <v-btn color="surface" aria-label="select all button" @click="selectAll()">All</v-btn>
          </v-col>
          <v-col cols="4" class="flex-right">
            <v-btn color="secondary" aria-label="save button" @click="saveBerries()">Save</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { islandImage } from '@/services/utils/image-utils'
import { berry, island } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IslandSelect',
  props: {
    previousBerries: {
      type: Array<berry.Berry>,
      default: []
    }
  },
  emits: ['favored-berries'],
  setup() {
    return { islandImage }
  },
  data: () => ({
    menu: false,
    favoredBerries: [] as berry.Berry[]
  }),
  computed: {
    berries() {
      return berry.BERRIES.sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  watch: {
    previousBerries: {
      handler(newBerries: berry.Berry[]) {
        this.favoredBerries = newBerries
      },
      immediate: true
    }
  },
  methods: {
    saveBerries() {
      this.menu = false
      this.updateBerries()
    },
    toggleBerry(berry: berry.Berry) {
      const index = this.favoredBerries.findIndex((item) => item.name === berry.name)

      if (index === -1) {
        this.favoredBerries = this.favoredBerries.concat(berry)
      } else {
        this.favoredBerries = this.favoredBerries.filter((b) => b.name !== berry.name)
      }
    },
    clear() {
      this.favoredBerries = []
    },
    selectAll() {
      this.favoredBerries = this.berries
    },
    selectCyan() {
      this.favoredBerries = island.CYAN.berries
    },
    selectTaupe() {
      this.favoredBerries = island.TAUPE.berries
    },
    selectSnowdrop() {
      this.favoredBerries = island.SNOWDROP.berries
    },
    selectLapis() {
      this.favoredBerries = island.LAPIS.berries
    },
    selectPowerPlant() {
      this.favoredBerries = island.POWER_PLANT.berries
    },
    updateBerries() {
      this.$emit('favored-berries', this.favoredBerries)
    }
  }
})
</script>
