<template>
  <v-container class="team-container">
    <v-card-actions class="px-0 pt-0" :disabled="!userStore.loggedIn">
      <v-btn
        icon="mdi-chevron-left"
        variant="plain"
        :disabled="!userStore.loggedIn"
        style="width: 36px; height: 36px"
        @click="teamStore.prev"
      ></v-btn>

      <TeamName />

      <v-btn
        class="team-label-margin"
        icon="mdi-chevron-right"
        variant="plain"
        :disabled="!userStore.loggedIn"
        style="width: 36px; height: 36px"
        @click="teamStore.next"
      ></v-btn>
    </v-card-actions>

    <v-window v-model="teamStore.currentIndex" continuous>
      <v-window-item v-for="(team, index) in teamStore.teams" :key="index">
        <v-row class="flex-nowrap" dense>
          <v-col v-for="member in 5" :key="member" class="team-slot">
            <TeamSlot :member-index="member - 1" />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <v-row class="pt-4">
      <v-col cols="12">
        <v-card height="400px" style="overflow: auto">
          <v-tabs v-model="tab">
            <v-tab value="team">Team</v-tab>
            <v-tab value="members">Members</v-tab>
          </v-tabs>

          <v-card-text>
            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="team">
                <v-card-text style="white-space: pre-wrap">
                  {{ teamProduction }}
                </v-card-text>
              </v-tabs-window-item>

              <v-tabs-window-item value="members">
                <v-card-text style="white-space: pre-wrap">
                  {{ memberProduction }}
                </v-card-text>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TeamName from '@/components/calculator/team-name.vue'
import TeamSlot from '@/components/calculator/team-slot.vue'
import { useNotificationStore } from '@/stores/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'

export default defineComponent({
  components: {
    TeamSlot,
    TeamName
  },
  setup() {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const notificationStore = useNotificationStore()
    return { userStore, teamStore, pokemonStore, notificationStore }
  },
  data: () => ({
    loadingTeams: true,
    tab: null
  }),
  computed: {
    teamProduction() {
      const production = this.teamStore.getCurrentTeam.production
      const berries = production?.team.berries
      const ingredients = production?.team.ingredients
      return berries && ingredients ? `${berries}\n${ingredients}` : 'No production'
    },
    memberProduction() {
      const production = this.teamStore.getCurrentTeam.production

      if (production?.members) {
        let result = ''
        for (const member of production.members) {
          const pkmn = this.pokemonStore.getPokemon(member.externalId)
          result += `${pkmn.pokemon.name} ${pkmn.name}\nBerries: ${member.berries}\nIngredients: ${member.ingredients}\nSkill procs: ${member.skillProcs}\n\n`
        }
        console.log(result)
        return result
      } else return 'No members'
    }
  },
  async mounted() {
    await this.teamStore.populateTeams()
  }
})
</script>

<style lang="scss">
.team-slot {
  aspect-ratio: 6 / 14;
  max-height: 25dvh;
}

.team-label-margin {
  margin-inline-start: 0 !important;
}

.team-container {
  max-width: 100%;
}

@media (min-width: 1000px) {
  .team-container {
    max-width: 50dvw;
  }
}
</style>
