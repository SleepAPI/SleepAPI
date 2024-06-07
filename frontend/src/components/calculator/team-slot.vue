<template>
  <v-card :loading="loading" class="fill-height frosted-glass" @click="openDetailsDialog">
    <v-img v-if="pokemonInstance" :src="imageUrl" />
    <div v-else class="d-flex align-center justify-center" style="height: 100%">
      <v-icon>mdi-plus</v-icon>
    </div>

    <TeamSlotMenu v-model:show="showTeamSlotDialog" :member-index="memberIndex" />
  </v-card>
</template>

<script lang="ts">
import TeamSlotMenu from '@/components/calculator/menus/team-slot-menu.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlot',
  components: {
    TeamSlotMenu
  },
  props: {
    memberIndex: {
      type: Number,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore }
  },
  data: () => ({
    loading: false,
    showTeamSlotDialog: false
  }),
  computed: {
    pokemonInstance() {
      return this.teamStore.getPokemon(this.memberIndex)
    },
    imageUrl(): string | undefined {
      return this.pokemonInstance
        ? `/images/pokemon/${this.pokemonInstance.pokemon.name.toLowerCase()}.png`
        : ''
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
