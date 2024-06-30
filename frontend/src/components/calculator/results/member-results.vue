<template>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex flex-column">
        <v-tabs-window v-model="tab" class="flex-grow-1">
          <v-tabs-window-item v-for="(member, index) in members" :key="index" :value="index">
            <v-card-text style="white-space: pre-wrap" class="text-center">
              {{ member.production }}
            </v-card-text>
          </v-tabs-window-item>
        </v-tabs-window>

        <v-tabs v-model="tab" fixed-tabs stacked density="compact" class="custom-tab">
          <v-tab v-for="(member, index) in members" :key="index" :value="index">
            <img
              :src="getMemberImage(member.member.pokemon.name)"
              alt="Pokemon Tab Image"
              class="tab-image"
            />
          </v-tab>
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
    members() {
      const currentTeam = this.teamStore.getCurrentTeam
      const members = []
      for (const member of currentTeam.members) {
        if (member) {
          members.push({
            member: this.pokemonStore.getPokemon(member),
            production: this.teamStore.getCurrentTeam.production?.members.find(
              (m) => m.externalId === member
            )
          })
        }
      }
      return members
    }
  },
  methods: {
    getMemberImage(name: string) {
      return `/images/pokemon/${name.toLowerCase()}.png`
    }
  }
})
</script>

<style lang="scss">
.custom-tab .v-tab__slider {
  top: 0;
}

.tab-image {
  height: 64px;
  width: 64px;
}
</style>
