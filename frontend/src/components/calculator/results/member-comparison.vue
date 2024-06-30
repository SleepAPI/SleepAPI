<template>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex flex-column">
        <v-card-text style="white-space: pre-wrap" class="text-center">
          Some comparison stuff here
        </v-card-text>
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
  }
})
</script>
