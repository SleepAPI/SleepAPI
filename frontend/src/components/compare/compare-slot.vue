<template>
  <div class="w-100 fill-height transparent">
    <!-- TODO: set loading while production is calculating -->
    <v-card :loading="false" class="w-100 fill-height frosted-glass rounded-b-0" @click="openDialog">
      <div class="text-center vertical-text" style="position: absolute; top: 0%; width: 100%; height: 100%">
        {{ pokemonInstance.name }}
      </div>
      <v-img :src="imageUrl" class="pokemon-image" data-testid="pokemon-image" />

      <div style="position: absolute; bottom: 0%; width: 100%">
        <v-card class="text-center text-x-small rounded-t-0" color="subskillWhite" location="bottom center">
          {{ rpBadge }}
        </v-card>
      </div>
    </v-card>

    <v-card
      class="text-center text-x-small text-no-wrap"
      rounded="lg"
      style="position: absolute; top: 0%; width: 80%"
      color="primary"
      location="top center"
    >
      {{ level }}
    </v-card>
  </div>
</template>

<script lang="ts">
import { pokemonImage } from '@/services/utils/image-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { RP, type PokemonInstance } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'CompareSlot',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    }
  },
  emits: ['edit-pokemon', 'duplicate-pokemon', 'remove-pokemon', 'toggle-save-state'],
  setup() {
    const pokemonStore = usePokemonStore()
    const comparisonStore = useComparisonStore()
    const dialogStore = useDialogStore()

    return { pokemonStore, comparisonStore, dialogStore }
  },
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
      this.dialogStore.openFilledSlot(this.pokemonInstance, this.comparisonStore.fullTeam, {
        onUpdate: (pokemon: PokemonInstance) => {
          this.$emit('edit-pokemon', pokemon)
        },
        onDuplicate: () => {
          this.$emit('duplicate-pokemon', this.pokemonInstance)
        },
        onToggleSaved: (state) => {
          this.toggleSavedState(state)
        },
        onRemove: () => {
          this.$emit('remove-pokemon', this.pokemonInstance)
        }
      })
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
</style>
