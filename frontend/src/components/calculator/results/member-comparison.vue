<template>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex flex-column">
        <v-data-table :items="members" hide-default-footer></v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { MathUtils, prettifyIngredientDrop } from 'sleepapi-common'

export default defineComponent({
  name: 'TeamResults',
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    return { teamStore, pokemonStore }
  },
  computed: {
    members() {
      const currentTeam = this.teamStore.getCurrentTeam
      const members = []

      const membersProduction = currentTeam.production?.members
      if (membersProduction) {
        for (const memberProduction of membersProduction) {
          members.push({
            pokemon: memberProduction.member.name,
            berries: `${MathUtils.round(memberProduction.berries?.amount ?? 0, 1)} ${memberProduction.berries?.berry.name}`,
            ingredients: prettifyIngredientDrop(memberProduction.ingredients, '\n'),
            'Skill procs': memberProduction.skillProcs
          })
        }
      }

      return members
    }
  }
})
</script>
