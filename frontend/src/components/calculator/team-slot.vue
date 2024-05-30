<template>
  <v-card :loading="loading" class="fill-height frosted-glass" @click="openDetailsDialog">
    <v-img v-if="pokemon" :src="imageUrl" />
    <div v-else class="d-flex align-center justify-center" style="height: 100%">
      <v-icon>mdi-plus</v-icon>
    </div>

    <TeamSlotMenu v-model:show="showTeamSlotDialog" :empty-slot="emptySlot" />
  </v-card>
</template>

<script lang="ts">
import TeamSlotMenu from '@/components/calculator/menus/team-slot-menu.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlot',
  components: {
    TeamSlotMenu
  },
  data: () => ({
    loading: false,
    showTeamSlotDialog: false,
    pokemon: '',
    imageUrl: ''
  }),
  computed: {
    emptySlot() {
      return this.pokemon === '' // TODO: update to better empty alg
    }
  },
  methods: {
    fetch() {
      this.loading = true
      setTimeout(() => (this.loading = false), 2000)
    },
    openDetailsDialog() {
      this.showTeamSlotDialog = true
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/colors';

.frosted-glass {
  background: rgba($surface, 0.4) !important;
  backdrop-filter: blur(10px);
}
</style>