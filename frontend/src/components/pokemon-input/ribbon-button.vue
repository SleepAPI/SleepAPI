<template>
  <v-menu id="ribbon-menu" v-model="menu" :close-on-content-click="true" offset-y>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon style="overflow: visible" elevation="0" color="transparent">
        <v-avatar style="overflow: visible" size="32">
          <v-img :src="ribbonImage" :class="ribbon === 0 ? 'greyScale' : ''"></v-img>
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
</template>

<script lang="ts">
export default {
  name: 'RibbonButton',
  props: {
    ribbon: {
      type: Number,
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
      const ribbonLevel = Math.max(this.ribbon, 1)
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

<style lang="scss">
.greyScale {
  filter: grayscale(100);
}
</style>
