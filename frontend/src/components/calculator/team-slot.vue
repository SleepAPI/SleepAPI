<template>
  <div v-if="pokemonInstance" class="w-100 fill-height transparent">
    <v-card :loading="loading" class="w-100 fill-height frosted-glass" @click="openDetailsDialog">
      <v-img :src="imageUrl" class="pokemon-image" />
    </v-card>

    <v-card
      class="text-center responsive-text"
      rounded="lg"
      style="position: absolute; top: 0%; width: 80%"
      color="primary"
      location="top center"
    >
      {{ level }}
    </v-card>

    <v-card
      v-if="hb"
      class="text-center"
      rounded="lg"
      style="position: absolute; bottom: 25%; left: 0%; width: 40%; font-size: 0.7rem"
      color="subskillGold"
    >
      HB
    </v-card>
    <v-card
      v-if="erb"
      class="text-center"
      rounded="lg"
      style="position: absolute; bottom: 10%; left: 0%; width: 40%; font-size: 0.7rem"
      color="subskillGold"
    >
      ERB
    </v-card>
  </div>
  <div v-else class="d-flex w-100 fill-height transparent">
    <v-card
      :loading="loading"
      class="d-flex w-100 fill-height frosted-glass"
      @click="openDetailsDialog"
    >
      <v-icon size="48" color="secondary" class="fill-height w-100 frosted-text">mdi-plus</v-icon>
    </v-card>
  </div>

  <!-- TODO: this will cause mount instantly instead of when slot is clicked, it's just hidden until clicked -->
  <TeamSlotMenu v-model:show="showTeamSlotDialog" :member-index="memberIndex" />
</template>

<script lang="ts">
import TeamSlotMenu from '@/components/calculator/menus/team-slot-menu.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { subskill } from 'sleepapi-common'
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
    },
    level() {
      if (this.pokemonInstance) {
        return `Level ${this.pokemonInstance.level}`
      } else return ''
    },
    erb() {
      return (
        this.pokemonInstance?.subskills &&
        this.pokemonInstance.subskills.some(
          (s) => s.subskill.name.toLowerCase() === subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase()
        )
      )
    },
    hb() {
      return (
        this.pokemonInstance?.subskills &&
        this.pokemonInstance.subskills.some(
          (s) => s.subskill.name.toLowerCase() === subskill.HELPING_BONUS.name.toLowerCase()
        )
      )
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
@import '@/assets/main';

.frosted-glass {
  background: rgba($surface, 0.4) !important;
  backdrop-filter: blur(10px);
}

.transparent {
  background: rgba($surface, 0) !important;
}

.pokemon-image {
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  left: 10%;
}
</style>
