<template>
  <v-container class="comparison-container">
    <v-row dense class="scroll-container" style="flex-wrap: nowrap">
      <!-- Filled compare slot -->
      <v-col
        v-for="(mon, index) in members"
        :key="index"
        class="compare-slot flex-grow-1"
        style="position: relative; min-width: 18%; max-width: 18%"
      >
        <!-- Filled slot, has its own nested pokemon slot menu -->
        <CompareSlot
          :pokemon-instance="mon"
          @edit-pokemon="editCompareMember"
          @duplicate-pokemon="duplicateCompareMember"
          @remove-pokemon="(pokemon) => removeCompareMember(pokemon, index)"
          @toggle-save-state="toggleSaveState"
        />
      </v-col>

      <!-- Click to add new pokemon -->
      <v-col class="compare-slot flex-grow-1" style="min-width: 20%; max-width: 20%" :hidden="comparisonStore.fullTeam">
        <div class="d-flex w-100 fill-height transparent">
          <v-card class="d-flex w-100 fill-height frosted-glass" @click="openPokemonSearch">
            <v-icon size="48" color="secondary" class="fill-height w-100 frosted-text">mdi-plus</v-icon>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <CompareSettings class="py-2" />

    <v-row dense>
      <v-col cols="12">
        <v-card color="transparent" :loading="loading">
          <v-tabs v-model="tab" class="d-flex justify-space-around">
            <v-tab
              v-for="tabItem in tabs"
              :key="tabItem.value"
              :value="tabItem.value"
              :class="[tab === tabItem.value ? 'frosted-glass-dark' : 'bg-surface', 'tab-item']"
            >
              {{ tabItem.label }}
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="overview">
              <CompareOverview />
            </v-tabs-window-item>

            <v-tabs-window-item value="strength">
              <CompareStrength />
            </v-tabs-window-item>

            <v-tabs-window-item value="misc">
              <CompareMisc />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import CompareMisc from '@/components/compare/compare-misc.vue'
import CompareOverview from '@/components/compare/compare-overview.vue'
import CompareSettings from '@/components/compare/compare-settings.vue'
import CompareSlot from '@/components/compare/compare-slot.vue'
import CompareStrength from '@/components/compare/compare-strength.vue'
import { TeamService } from '@/services/team/team-service'
import { randomName } from '@/services/utils/name-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { UnexpectedError } from '@/types/errors/unexpected-error'
import { DEFAULT_ISLAND, uuid, type PokemonInstance, type TeamSettingsDto } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ComparisonPage',
  components: {
    CompareSlot,
    CompareOverview,
    CompareStrength,
    CompareMisc,
    CompareSettings
  },
  setup() {
    const pokemonStore = usePokemonStore()
    const comparisonStore = useComparisonStore()
    const dialogStore = useDialogStore()
    return { pokemonStore, comparisonStore, dialogStore }
  },
  data: () => ({
    tab: null,
    tabs: [
      { value: 'overview', label: 'Overview' },
      { value: 'strength', label: 'Strength' },
      { value: 'misc', label: 'Misc' }
    ],
    loading: false
  }),
  computed: {
    members() {
      const members: PokemonInstance[] = []
      for (const member of this.comparisonStore.members) {
        const pokemon = this.pokemonStore.getPokemon(member.externalId)
        pokemon && members.push(pokemon)
      }
      return members
    }
  },
  methods: {
    openPokemonSearch() {
      this.dialogStore.openPokemonSearch((pokemonInstance) => {
        this.addToCompareMembers(pokemonInstance)
      })
    },
    async addToCompareMembers(pokemonInstance: PokemonInstance) {
      this.loading = true
      const memberProduction = await this.fetchCompareMemberProduction(pokemonInstance)
      this.comparisonStore.members.push(memberProduction)

      const previouslyExisted = this.pokemonStore.getPokemon(pokemonInstance.externalId)
      if (pokemonInstance.saved && previouslyExisted === undefined) {
        this.pokemonStore.upsertServerPokemon(pokemonInstance)
      } else {
        this.pokemonStore.upsertLocalPokemon(pokemonInstance)
      }

      this.loading = false
    },
    async removeCompareMember(pokemonInstance: PokemonInstance, index: number) {
      this.comparisonStore.removeMember(pokemonInstance.externalId, index)
    },
    async editCompareMember(pokemonInstance: PokemonInstance) {
      this.loading = true
      const memberProduction = await this.fetchCompareMemberProduction(pokemonInstance)

      const previouslyExisted = this.pokemonStore.getPokemon(pokemonInstance.externalId)
      if (previouslyExisted?.saved || pokemonInstance.saved) {
        this.pokemonStore.upsertServerPokemon(pokemonInstance)
      } else {
        this.pokemonStore.upsertLocalPokemon(pokemonInstance)
      }

      const indexToUpdate = this.comparisonStore.members.findIndex(
        (pkmn) => pkmn.externalId === pokemonInstance.externalId
      )

      this.comparisonStore.members[indexToUpdate] = memberProduction
      this.loading = false
    },
    async fetchCompareMemberProduction(pokemonInstance: PokemonInstance) {
      const members: PokemonInstance[] = [pokemonInstance]
      const maybeTeam = this.comparisonStore.currentTeam
      for (const member of maybeTeam?.members ?? []) {
        if (member) {
          const pokemon = this.pokemonStore.getPokemon(member)
          pokemon && members.push(pokemon)
        }
      }
      const settings: TeamSettingsDto = {
        camp: maybeTeam?.camp ?? false,
        bedtime: maybeTeam?.bedtime ?? '21:30',
        wakeup: maybeTeam?.wakeup ?? '06:00',
        stockpiledIngredients: maybeTeam?.stockpiledIngredients ?? [],
        island: maybeTeam?.island ?? { ...DEFAULT_ISLAND }
      }

      const result = await TeamService.calculateProduction({ members, settings })
      const production = result?.members.find((member) => member.externalId === pokemonInstance.externalId)
      if (!production) {
        throw new UnexpectedError(
          `Team sim did not return expected compare member with id: ${pokemonInstance.externalId}`
        )
      }

      return production
    },
    duplicateCompareMember(pokemonInstance: PokemonInstance) {
      const copiedProduction = this.comparisonStore.members.find(
        (pkmn) => pkmn.externalId === pokemonInstance.externalId
      )
      if (!copiedProduction) {
        console.error("Can't find pokemon to duplicate in the list, contact developer")
      } else {
        const duplicatedMember: PokemonInstance = {
          ...pokemonInstance,
          version: 0,
          saved: false,
          externalId: uuid.v4(),
          name: randomName(pokemonInstance.pokemon, 12, pokemonInstance.gender)
        }
        this.comparisonStore.addMember({
          ...copiedProduction,
          externalId: duplicatedMember.externalId
        })
        this.pokemonStore.upsertLocalPokemon(duplicatedMember)
      }
    },
    toggleSaveState(pokemonInstance: PokemonInstance) {
      const previouslyExisted = this.pokemonStore.getPokemon(pokemonInstance.externalId)
      if (previouslyExisted?.saved || pokemonInstance.saved) {
        this.pokemonStore.upsertServerPokemon(pokemonInstance)
      } else {
        this.pokemonStore.upsertLocalPokemon(pokemonInstance)
      }
    }
  }
})
</script>

<style lang="scss">
.tab-item {
  flex: 1;
}

.compare-slot {
  max-height: 25dvh;
  aspect-ratio: 6 / 10;
}

.comparison-container {
  max-width: 100%;
}

.scroll-container {
  overflow-x: auto;
}

@media (min-width: $desktop) {
  .comparison-container {
    max-width: 60dvw;
  }
}
</style>
