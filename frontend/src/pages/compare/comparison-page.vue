<template>
  <v-container class="team-container">
    <v-row dense class="scroll-container" style="flex-wrap: nowrap">
      <!-- Filled compare slot -->
      <v-col
        v-for="(mon, index) in comparisonStore.members"
        :key="index"
        class="team-slot flex-grow-1"
        style="position: relative; min-width: 18%; max-width: 18%"
      >
        <CompareSlot
          :pokemon-instance="mon"
          @edit-pokemon="editCompareMember"
          @duplicate-pokemon="duplicateCompareMember"
          @remove-pokemon="removeCompareMember"
          @toggle-save-state="toggleSaveState"
        />
      </v-col>

      <!-- Click to add new pokemon -->
      <v-col
        class="team-slot flex-grow-1"
        style="min-width: 20%; max-width: 20%"
        :hidden="comparisonStore.fullTeam"
      >
        <div class="d-flex w-100 fill-height transparent">
          <v-card class="d-flex w-100 fill-height frosted-glass" @click="openDialog">
            <v-icon size="48" color="secondary" class="fill-height w-100 frosted-text"
              >mdi-plus</v-icon
            >
          </v-card>
        </div>
      </v-col>

      <PokemonSlotMenu
        v-model:show="showDialog"
        :pokemon-from-pre-exist="undefined"
        :full-team="false"
        @update-pokemon="addToCompareMembers"
        @remove-pokemon="removeCompareMember"
      />
    </v-row>

    <!-- TODO: should add settings component here -->

    <v-row>
      <v-col cols="12">
        <v-card color="transparent" :loading="loading">
          <v-tabs v-model="tab" class="d-flex justify-space-around">
            <v-tab
              v-for="tabItem in tabs"
              :key="tabItem.value"
              :value="tabItem.value"
              :class="[tab === tabItem.value ? 'frosted-tab' : 'bg-surface', 'tab-item']"
            >
              {{ tabItem.label }}
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="overview">
              <CompareOverview />
            </v-tabs-window-item>

            <v-tabs-window-item value="strength">
              <!-- TODO: replace -->
              <CompareOverview />
            </v-tabs-window-item>

            <v-tabs-window-item value="misc">
              <!-- TODO: replace -->
              <CompareOverview />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import CompareOverview from '@/components/compare/compare-overview.vue'
import CompareSlot from '@/components/compare/compare-slot.vue'
import PokemonSlotMenu from '@/components/pokemon-input/menus/pokemon-slot-menu.vue'
import { ProductionService } from '@/services/production/production-service'
import { randomName } from '@/services/utils/name-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import {
  uuid,
  type DetailedProduce,
  type PokemonInstanceExt,
  type SingleProductionResponse
} from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ComparisonPage',
  components: { PokemonSlotMenu, CompareSlot, CompareOverview },
  setup() {
    const pokemonStore = usePokemonStore()
    const comparisonStore = useComparisonStore()
    return { pokemonStore, comparisonStore }
  },
  data: () => ({
    showDialog: false,
    tab: null,
    tabs: [
      { value: 'overview', label: 'Overview' },
      { value: 'strength', label: 'Strength' },
      { value: 'misc', label: 'Misc' }
    ],
    loading: false
  }),
  methods: {
    openDialog() {
      this.showDialog = true
    },
    async addToCompareMembers(pokemonInstance: PokemonInstanceExt) {
      this.loading = true
      const simulationData: SingleProductionResponse =
        await ProductionService.calculateSingleProduction(pokemonInstance)
      const production: DetailedProduce = simulationData.production.detailedProduce

      const memberProduction: MemberProductionExt = {
        member: pokemonInstance,
        ingredients: production.produce.ingredients,
        skillProcs: production.averageTotalSkillProcs,
        berries: production.produce.berries
      }
      this.comparisonStore.members.push(memberProduction)

      const previouslyExisted = this.pokemonStore.getPokemon(pokemonInstance.externalId)
      if (pokemonInstance.saved && previouslyExisted === undefined) {
        this.pokemonStore.upsertServerPokemon(pokemonInstance)
      }

      this.loading = false
    },
    async editCompareMember(pokemonInstance: PokemonInstanceExt) {
      this.loading = true
      const simulationData: SingleProductionResponse =
        await ProductionService.calculateSingleProduction(pokemonInstance)
      const production: DetailedProduce = simulationData.production.detailedProduce

      const previouslyExisted = this.pokemonStore.getPokemon(pokemonInstance.externalId)
      if (previouslyExisted?.saved || pokemonInstance.saved) {
        this.pokemonStore.upsertServerPokemon(pokemonInstance)
      }

      const memberProduction: MemberProductionExt = {
        member: pokemonInstance,
        ingredients: production.produce.ingredients,
        skillProcs: production.averageTotalSkillProcs,
        berries: production.produce.berries
      }

      const indexToUpdate = this.comparisonStore.members.findIndex(
        (pkmn) => pkmn.member.externalId === pokemonInstance.externalId
      )

      this.comparisonStore.members[indexToUpdate] = memberProduction
      this.loading = false
    },
    duplicateCompareMember(pokemonInstance: PokemonInstanceExt) {
      const copiedProduction = this.comparisonStore.members.find(
        (pkmn) => pkmn.member.externalId === pokemonInstance.externalId
      )
      if (!copiedProduction) {
        console.error("Can't find pokemon to duplicate in the list, contact developer")
      } else {
        const duplicatedMember: PokemonInstanceExt = {
          ...pokemonInstance,
          version: 0,
          saved: false,
          externalId: uuid.v4(),
          name: randomName(12)
        }
        this.comparisonStore.addMember({ ...copiedProduction, member: duplicatedMember })
      }
    },
    removeCompareMember(pokemonInstance: PokemonInstanceExt) {
      this.comparisonStore.members = this.comparisonStore.members.filter(
        (pkmn) => pkmn.member.externalId !== pokemonInstance.externalId
      )
    },
    toggleSaveState(pokemonInstance: PokemonInstanceExt) {
      this.comparisonStore.members = this.comparisonStore.members.map((pkmn) => ({
        ...pkmn,
        member: {
          ...pkmn.member,
          saved:
            pkmn.member.externalId === pokemonInstance.externalId
              ? pokemonInstance.saved
              : pkmn.member.saved
        }
      }))
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main';

.frosted-tab {
  background: rgba($surface, 0.8) !important;
  backdrop-filter: blur(10px);
}
.frosted-glass {
  background: rgba($surface, 0.4) !important;
  backdrop-filter: blur(10px);
}

.tab-item {
  flex: 1;
}

.team-slot {
  max-height: 25dvh;
  aspect-ratio: 6 / 10;
}

.team-container {
  max-width: 100%;
}

.scroll-container {
  display: flex;
  overflow-x: auto;
}

@media (min-width: 1000px) {
  .team-container {
    max-width: 50dvw;
  }
}
</style>