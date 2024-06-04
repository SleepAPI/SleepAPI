<template>
  <v-badge
    color="secondary"
    class="flex-center"
    location="top left"
    offset-x="auto"
    :model-value="locked"
  >
    <template #badge>
      <v-icon left class="mr-1">mdi-lock</v-icon>
      Lv.{{ ingredientLevel }}
    </template>
    <v-speed-dial v-model="fab" location="top center" transition="fade-transition">
      <template #activator="{ props }">
        <!-- TODO: add small badge with amount of the ingredient this mon has at this level -->
        <v-btn icon :class="{ 'disabled-image-btn': locked }" :disabled="disabled" v-bind="props">
          <v-avatar>
            <v-img id="ingredientImage" :src="ingredientImage"></v-img>
          </v-avatar>
        </v-btn>
      </template>

      <v-btn
        v-for="key in otherIngredientOptions"
        :key="key.ingredient.name"
        color="primary"
        size="large"
        icon
        @click="handleIngredientClick(key)"
      >
        <v-avatar>
          <v-img :src="ingredientImageForNameKey(key.ingredient.name)"></v-img>
        </v-avatar>
      </v-btn>
    </v-speed-dial>
  </v-badge>
</template>

<script lang="ts">
import type { IngredientSet, pokemon } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'IngredientButton',
  props: {
    ingredientLevel: {
      type: Number,
      required: true
    },
    pokemonLevel: {
      type: Number,
      required: true
    },
    pokemon: {
      type: Object as PropType<pokemon.Pokemon>,
      required: true
    }
  },
  emits: ['update-ingredient'],
  data: () => ({
    ingredientSet: undefined as IngredientSet | undefined,
    fab: false,
    updateTimer: null as ReturnType<typeof setTimeout> | null
  }),
  computed: {
    ingredientImage() {
      return this.ingredientSet
        ? `/images/ingredient/${this.ingredientSet.ingredient.name.toLowerCase()}.png`
        : '/images/pokemon/unknown.png'
    },
    locked() {
      return this.pokemonLevel < this.ingredientLevel
    },
    disabled() {
      return !this.ingredientSet || this.ingredientLevel < 30 // first ingredient is always disabled
    },
    otherIngredientOptions() {
      if (this.ingredientLevel < 30) {
        return []
      } else if (this.ingredientLevel < 60) {
        return this.pokemon.ingredient30.filter(
          (ing) =>
            ing.ingredient.name.toLowerCase() !== this.ingredientSet?.ingredient.name.toLowerCase()
        )
      } else
        return this.pokemon.ingredient60.filter(
          (ing) =>
            ing.ingredient.name.toLowerCase() !== this.ingredientSet?.ingredient.name.toLowerCase()
        )
    }
  },
  watch: {
    pokemon: {
      immediate: true,
      handler(newPokemon: pokemon.Pokemon) {
        if (this.ingredientLevel < 30) {
          this.ingredientSet = newPokemon.ingredient0
        } else if (this.ingredientLevel < 60) {
          this.ingredientSet = newPokemon.ingredient30[0]
        } else {
          this.ingredientSet = newPokemon.ingredient60[0]
        }

        this.$emit('update-ingredient', {
          ingredient: this.ingredientSet.ingredient,
          ingredientLevel: this.ingredientLevel
        })
      }
    }
  },
  beforeUnmount() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }
  },
  methods: {
    ingredientImageForNameKey(key: string) {
      if (!this.pokemon) {
        return '/images/pokemon/unknown.png'
      }
      return `/images/ingredient/${key.toLowerCase()}.png`
    },
    handleIngredientClick(ingredientSet: IngredientSet) {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer)
      }
      this.updateTimer = setTimeout(() => {
        this.updateIngredient(ingredientSet)
        this.updateTimer = null
      }, 200) // Delay update by 300ms to smooth transition
    },
    updateIngredient(ingredientSet: IngredientSet) {
      if (!this.pokemon || !this.ingredientSet) {
        return
      }

      this.ingredientSet = ingredientSet
      this.$emit('update-ingredient', {
        ingredient: this.ingredientSet.ingredient,
        ingredientLevel: this.ingredientLevel
      })
    }
  }
}
</script>
