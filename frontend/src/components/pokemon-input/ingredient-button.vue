<template>
  <v-badge color="secondary" class="flex-center" location="top left" offset-x="auto" :model-value="locked">
    <template #badge>
      <v-icon left class="mr-1">mdi-lock</v-icon>
      Lv.{{ ingredientLevel }}
    </template>
    <v-speed-dial
      :content-class="{ 'wide-speed-dial': otherIngredientOptions.length > 2 }"
      v-model="fab"
      location="top center"
      transition="fade-transition"
    >
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
import { commonMocks, type IngredientSet, type Pokemon, type PokemonInstance } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'IngredientButton',
  props: {
    ingredientLevel: {
      type: Number,
      required: true
    },
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    }
  },
  emits: ['update-ingredient'],
  data: () => ({
    fab: false,
    updateTimer: null as ReturnType<typeof setTimeout> | null
  }),
  computed: {
    ingredientSet() {
      return this.pokemonInstance.ingredients[Math.floor(Math.min(this.ingredientLevel / 30, 2))]
    },
    ingredientImage() {
      return this.ingredientSet
        ? `/images/ingredient/${this.ingredientSet.ingredient.name.toLowerCase()}.png`
        : '/images/pokemon/unknown.png'
    },
    locked() {
      return this.pokemonLevel < this.ingredientLevel
    },
    disabled() {
      return !this.ingredientSet || this.otherIngredientOptions.length === 0
    },
    pokemon() {
      return this.pokemonInstance.pokemon
    },
    pokemonLevel() {
      return this.pokemonInstance.level
    },
    otherIngredientOptions() {
      let ingredientOptions: IngredientSet[] = []

      if (this.ingredientLevel == 0) {
        ingredientOptions = this.pokemonInstance.pokemon.ingredient0
      } else if (this.ingredientLevel == 30) {
        ingredientOptions = this.pokemonInstance.pokemon.ingredient30
      } else {
        ingredientOptions = this.pokemonInstance.pokemon.ingredient60
      }

      return ingredientOptions.filter(
        (ing) => ing.ingredient.name.toLowerCase() !== this.ingredientSet?.ingredient.name.toLowerCase()
      )
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

      this.$emit('update-ingredient', {
        ingredientSet,
        ingredientLevel: this.ingredientLevel
      })
    },
    loadFromExisting(oldPokemon: Pokemon) {
      const existingIngredients = this.pokemonInstance.ingredients.length === 3

      return oldPokemon.name === commonMocks.mockPokemon().name && existingIngredients
    }
  }
}
</script>

<style lang="scss">
.wide-speed-dial.v-overlay__content.v-speed-dial__content {
  flex-direction: row !important;
  flex-wrap: wrap;
  width: 176px;
  justify-content: center;
  padding: 8px;
  border-radius: 16px;
  background-color: rgba($background, 0.8);

  button {
    transition-delay: 0s;
  }
}
</style>
