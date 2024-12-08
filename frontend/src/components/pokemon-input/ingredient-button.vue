<template>
  <v-badge color="secondary" class="flex-center" location="top left" offset-x="auto" :model-value="locked">
    <template #badge>
      <v-icon left class="mr-1">mdi-lock</v-icon>
      Lv.{{ ingredientLevel }}
    </template>
    <v-speed-dial v-model="fab" location="top center" transition="fade-transition">
      <template #activator="{ props }">
        <v-badge :content="ingredientSet?.amount" color="accent" text-color="background" offset-x="5" offset-y="5">
          <v-btn icon :class="{ 'disabled-image-btn': locked }" :disabled="disabled" v-bind="props">
            <v-avatar>
              <v-img id="ingredientImage" :src="ingredientImage"></v-img>
            </v-avatar>
          </v-btn>
        </v-badge>
      </template>

      <v-btn
        v-for="key in otherIngredientOptions"
        :key="key.ingredient.name"
        color="accent"
        size="48"
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
import { mockPokemon, type IngredientSet, type Pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'IngredientButton',
  props: {
    ingredientLevel: {
      type: Number,
      required: true
    },
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
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
    pokemon() {
      return this.pokemonInstance.pokemon
    },
    pokemonLevel() {
      return this.pokemonInstance.level
    },
    otherIngredientOptions() {
      if (this.ingredientLevel < 30) {
        return []
      } else if (this.ingredientLevel < 60) {
        return this.pokemonInstance.pokemon.ingredient30.filter(
          (ing) => ing.ingredient.name.toLowerCase() !== this.ingredientSet?.ingredient.name.toLowerCase()
        )
      } else
        return this.pokemonInstance.pokemon.ingredient60.filter(
          (ing) => ing.ingredient.name.toLowerCase() !== this.ingredientSet?.ingredient.name.toLowerCase()
        )
    }
  },
  watch: {
    pokemon: {
      deep: false,
      handler(newPokemon: Pokemon, oldPokemon: Pokemon) {
        // only grab from cache on initial setup, if pre-existing value exists
        if (this.ingredientLevel < 30) {
          this.ingredientSet = newPokemon.ingredient0
        } else {
          if (this.loadFromExisting(oldPokemon)) {
            if (this.ingredientLevel === 30) {
              this.ingredientSet = newPokemon.ingredient30.find(
                (ing) => ing.ingredient.name === this.pokemonInstance.ingredients[1].ingredient.name
              )
            } else {
              this.ingredientSet = newPokemon.ingredient60.find(
                (ing) => ing.ingredient.name === this.pokemonInstance.ingredients[2].ingredient.name
              )
            }
          } else {
            if (this.ingredientLevel === 30) {
              this.ingredientSet = newPokemon.ingredient30[0]
            } else {
              this.ingredientSet = newPokemon.ingredient60[0]
            }
          }
        }

        this.$emit('update-ingredient', {
          ingredient: this.ingredientSet?.ingredient,
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
      if (!this.ingredientSet) {
        return
      }

      this.ingredientSet = ingredientSet
      this.$emit('update-ingredient', {
        ingredient: this.ingredientSet.ingredient,
        ingredientLevel: this.ingredientLevel
      })
    },
    loadFromExisting(oldPokemon: Pokemon) {
      const existingIngredients =
        this.pokemonInstance.ingredients.filter((ing) => ing.ingredient !== undefined).length === 3

      return oldPokemon.name === mockPokemon.name && existingIngredients
    }
  }
}
</script>
