<template>
  <div class="w-100 fill-height transparent">
    <!-- TODO: set loading while production is calculating -->
    <v-card :loading="false" class="w-100 fill-height frosted-glass rounded-b-0" @click="openDialog">
      <div class="text-center vertical-text" style="position: absolute; top: 0%; width: 100%; height: 100%">
        {{ pokemonInstance.name }}
      </div>
      <v-img :src="imageUrl" class="pokemon-image" />

      <div style="position: absolute; bottom: 0%; width: 100%">
        <v-card class="text-center xsmall-responsive-text rounded-t-0" color="subskillWhite" location="bottom center">
          {{ rpBadge }}
        </v-card>
      </div>
    </v-card>

    <v-card
      class="text-center xsmall-responsive-text"
      rounded="lg"
      style="position: absolute; top: 0%; width: 80%; font-size: 0.8rem"
      color="primary"
      location="top center"
    >
      {{ level }}
    </v-card>

    <PokemonSlotMenu
      v-model:show="showDialog"
      :pokemon-from-pre-exist="pokemonInstance"
      :full-team="comparisonStore.fullTeam"
      @update-pokemon="editCompareMember"
      @duplicate-pokemon="duplicateCompareMember"
      @toggle-saved-pokemon="toggleSavedState"
      @remove-pokemon="removeCompareMember"
    />
  </div>
</template>

<script lang="ts">
import PokemonSlotMenu from '@/components/pokemon-input/menus/pokemon-slot-menu.vue'
import { pokemonImage } from '@/services/utils/image-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { RP, type PokemonInstanceExt } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'CompareSlot',
  components: {
    PokemonSlotMenu
  },
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['edit-pokemon', 'duplicate-pokemon', 'remove-pokemon', 'toggle-save-state'],
  setup() {
    const pokemonStore = usePokemonStore()
    const comparisonStore = useComparisonStore()

    return { pokemonStore, comparisonStore }
  },
  data: () => ({
    showDialog: false
  }),
  computed: {
    imageUrl(): string | undefined {
      return (
        this.pokemonInstance &&
        pokemonImage({
          pokemonName: this.pokemonInstance.pokemon.name,
          shiny: this.pokemonInstance.shiny
        })
      )
    },
    level() {
      return `Level ${this.pokemonInstance.level}`
    },
    rpBadge() {
      const rpUtil = new RP(this.pokemonInstance)
      const rp = this.pokemonInstance.rp ?? rpUtil.calc()
      return `RP ${rp}`
    }
  },
  methods: {
    openDialog() {
      this.showDialog = true
    },
    editCompareMember(pokemonInstance: PokemonInstanceExt) {
      this.$emit('edit-pokemon', pokemonInstance)
    },
    duplicateCompareMember(pokemonInstance: PokemonInstanceExt) {
      this.$emit('duplicate-pokemon', pokemonInstance)
    },
    removeCompareMember(pokemonInstance: PokemonInstanceExt) {
      this.$emit('remove-pokemon', pokemonInstance)
    },
    async toggleSavedState(state: boolean) {
      const updatedMon = { ...this.pokemonInstance, saved: state }
      this.pokemonStore.upsertServerPokemon(updatedMon)

      this.$emit('toggle-save-state', updatedMon)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/main';

.transparent {
  background: rgba($surface, 0) !important;
}

.pokemon-image {
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  left: 10%;
}

.vertical-text {
  color: rgba(white, 0.6) !important;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  white-space: nowrap;
  text-align: center;
}

.xsmall-responsive-text {
  font-size: 0.8rem !important;
}

@media (max-width: 365px) {
  .xsmall-responsive-text {
    font-size: 0.7rem !important;
  }
}
</style>
