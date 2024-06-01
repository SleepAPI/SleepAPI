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
        <v-btn icon :class="{ 'disabled-image-btn': locked }" :disabled="disabled" v-bind="props">
          <v-avatar>
            <v-img id="ingredientImage" :src="ingredientImage"></v-img>
          </v-avatar>
        </v-btn>
      </template>

      <v-btn
        v-for="key in otherIngredientOptions"
        :key="key.ingredient.name"
        color="secondary"
        icon
        @click="updateIngredient(key)"
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
      type: Object as PropType<pokemon.Pokemon | undefined>,
      required: false,
      default: undefined
    }
  },
  emits: ['update-ingredient'],
  data: () => ({
    ingredientSet: undefined as IngredientSet | undefined,
    fab: false,
    otherIngredientOptions: [] as IngredientSet[]
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
    }
  },
  watch: {
    pokemon: {
      immediate: true,
      handler(newPokemon: pokemon.Pokemon) {
        if (newPokemon) {
          if (this.ingredientLevel < 30) {
            this.ingredientSet = newPokemon.ingredient0
          } else if (this.ingredientLevel < 60) {
            this.otherIngredientOptions = [newPokemon.ingredient30[1]]
            this.ingredientSet = newPokemon.ingredient30[0]
          } else {
            this.otherIngredientOptions = [newPokemon.ingredient60[1], newPokemon.ingredient60[2]]
            this.ingredientSet = newPokemon.ingredient60[0]
          }
        }
      }
    }
  },
  methods: {
    ingredientImageForNameKey(key: string) {
      if (!this.pokemon) {
        return '/images/pokemon/unknown.png'
      }
      return `/images/ingredient/${key.toLowerCase()}.png`
    },
    updateIngredient(ingredientSet: IngredientSet) {
      if (!this.pokemon || !this.ingredientSet) {
        return
      }
      // put previous ingredient list back as option available
      this.otherIngredientOptions = this.otherIngredientOptions
        .filter((ing) => ing.ingredient.name !== ingredientSet.ingredient.name)
        .concat(this.ingredientSet)

      this.ingredientSet = ingredientSet
      this.$emit('update-ingredient', {
        ingredientSet,
        ingredientLevel: this.ingredientLevel
      })
    }
  }
}
</script>
