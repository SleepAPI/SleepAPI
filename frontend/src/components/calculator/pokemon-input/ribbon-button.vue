<template>
  <v-menu id="ribbon-menu" v-model="menu" :close-on-content-click="true" offset-y>
    <template #activator="{ props }">
      <!-- TODO: why does this have -4px inside the compoennt? -->
      <v-btn
        v-bind="props"
        color="surface"
        icon
        style="margin-top: -4px; overflow: visible"
        elevation="0"
      >
        <v-badge
          :content="badgeLabel()"
          :model-value="ribbon > 0"
          location="top center"
          offset-y="-12"
          color="subskillWhite"
        >
          <v-avatar style="overflow: visible">
            <v-img src="/images/misc/ribbon.png" :class="ribbon === 0 ? 'greyScale' : ''"></v-img>
          </v-avatar>
        </v-badge>
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
  methods: {
    selectValue(value: number) {
      console.log('clicked')
      this.updateRibbon(value)
      this.menu = false
    },
    updateRibbon(newRibbon: number) {
      this.$emit('update-ribbon', newRibbon)
    },
    ribbonLabel(level: number) {
      const labels = ['No ribbon', '200 hours', '500 hours', '1000 hours', '2000 hours']
      return labels[level]
    },
    badgeLabel() {
      const labels = ['0', '200', '500', '1000', '2000']
      return labels[this.ribbon]
    }
  }
}
</script>

<style lang="scss">
.greyScale {
  filter: grayscale(100);
}
</style>
