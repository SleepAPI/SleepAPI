<template>
  <div class="ribbon-carry-container">
    <v-menu id="ribbon-menu" v-model="menu" :close-on-content-click="true" offset-y>
      <template #activator="{ props }">
        <v-btn v-bind="props" icon elevation="0" size="40" color="surface">
          <v-avatar size="40">
            <v-img
              :src="ribbonImage"
              :class="pokemonInstance.ribbon === 0 ? 'greyScale' : ''"
              data-testid="ribbon-image"
            ></v-img>
          </v-avatar>
        </v-btn>
      </template>

      <v-card>
        <v-list density="compact">
          <v-list-item v-for="value in ribbonLevels" :key="value" @click="updateRibbon(value)">
            <v-list-item-title>{{ ribbonLabel(value) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <CarrySizeDisplay :pokemon-instance="pokemonInstance" />
  </div>
</template>

<script lang="ts">
import type { PokemonInstance } from 'sleepapi-common'
import type { PropType } from 'vue'
import CarrySizeDisplay from './carry-size-display.vue'

export default {
  name: 'RibbonButton',
  components: {
    CarrySizeDisplay
  },
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    }
  },
  emits: ['update-ribbon'],
  data: () => ({
    menu: false,
    ribbonLevels: [0, 1, 2, 3, 4]
  }),
  computed: {
    ribbonImage() {
      const ribbonLevel = Math.max(this.pokemonInstance.ribbon, 1)
      return `/images/misc/ribbon${ribbonLevel}.png`
    }
  },
  methods: {
    selectValue(value: number) {
      this.updateRibbon(value)
      this.menu = false
    },
    updateRibbon(newRibbon: number) {
      this.$emit('update-ribbon', newRibbon)
    },
    ribbonLabel(level: number) {
      const labels = ['No ribbon', '200 hours', '500 hours', '1000 hours', '2000 hours']
      return labels[level]
    }
  }
}
</script>

<style lang="scss" scoped>
.greyScale {
  filter: grayscale(100);
}

.ribbon-carry-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
