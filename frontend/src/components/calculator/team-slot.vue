<template>
  <v-card :loading="loading" class="fill-height frosted-glass" @click="openDetailsDialog">
    <v-img v-if="pokemon" :src="imageUrl" />
    <div v-else class="d-flex align-center justify-center" style="height: 100%">
      <v-icon>mdi-plus</v-icon>
    </div>

    <FilledSlotMenu
      :show="showSelectDialog"
      @update-selected="updateSelected"
      @close-dialog="closeDetailsDialog"
    >
    </FilledSlotMenu>
  </v-card>
</template>

<script lang="ts">
import FilledSlotMenu from '@/components/calculator/menus/filled-slot-menu.vue'
import { CalculatorService } from '@/services/calculator/calculator-service'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlot',
  components: {
    FilledSlotMenu
  },
  data: () => ({
    loading: false,
    showSelectDialog: false,
    pokemon: '',
    imageUrl: ''
  }),
  methods: {
    fetch() {
      this.loading = true
      setTimeout(() => (this.loading = false), 2000)
    },
    openDetailsDialog() {
      this.showSelectDialog = true
    },
    closeDetailsDialog() {
      this.showSelectDialog = false
    },
    async updateSelected(option: string) {
      this.pokemon = option
      this.loading = true

      await CalculatorService.fetchCardImage(option).then((imageUrl) => {
        this.imageUrl = imageUrl
        this.loading = false
      })
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/colors';

.frosted-glass {
  background: rgba($secondary, 0.4) !important;
  backdrop-filter: blur(10px);
}
</style>
