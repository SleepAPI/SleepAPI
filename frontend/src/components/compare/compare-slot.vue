<template>
  <PokemonSlotDisplay
    :name="pokemonInstance.name"
    :image-url="imageUrl"
    :level="level"
    :badge="rpBadge"
    badge-color="subskillWhite"
    @click="openDialog"
  />
</template>

<script lang="ts">
import PokemonSlotDisplay from '@/components/custom-components/pokemon-slot-display.vue'
import { pokemonImage } from '@/services/utils/image-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { RP, type PokemonInstanceExt } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'CompareSlot',
  components: { PokemonSlotDisplay },
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
        onUpdate: (pokemon: PokemonInstanceExt) => {
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
