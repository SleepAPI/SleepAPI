<template>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex flex-column">
        <v-tabs-window v-model="tab" class="flex-grow-1">
          <v-tabs-window-item value="overview">
            <v-card-text style="white-space: pre-wrap" class="text-center">
              {{ teamProduction }}
            </v-card-text>
          </v-tabs-window-item>
          <v-tabs-window-item value="cooking">
            <v-card-text style="white-space: pre-wrap" class="text-center">
              {{ teamProduction }}
            </v-card-text>
          </v-tabs-window-item>
          <v-tabs-window-item value="analysis">
            <v-card-text style="white-space: pre-wrap" class="text-center">
              {{ teamProduction }}
            </v-card-text>
          </v-tabs-window-item>
        </v-tabs-window>

        <v-tabs
          v-model="tab"
          fixed-tabs
          stacked
          bg-color="surface"
          density="compact"
          class="custom-tab"
        >
          <v-tab value="overview"><v-icon icon="mdi-view-dashboard"></v-icon>Overview</v-tab>
          <v-tab value="cooking"><v-icon icon="mdi-magnify"></v-icon>Cooking</v-tab>
          <v-tab value="analysis"><v-icon icon="mdi-poll"></v-icon>Analysis</v-tab>
        </v-tabs>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
export default defineComponent({
  name: 'TeamResults',
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    return { teamStore, pokemonStore }
  },
  data: () => ({
    tab: null
  }),
  computed: {
    teamProduction() {
      const production = this.teamStore.getCurrentTeam.production
      const berries = production?.team.berries
      const ingredients = production?.team.ingredients
      return berries && ingredients ? `${berries}\n${ingredients}` : 'No production'
    }
  }
})
</script>

<style lang="scss">
.custom-tab .v-tab__slider {
  top: 0;
}
</style>
