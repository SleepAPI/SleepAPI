<template>
  <v-row>
    <v-col cols="12" class="fill-height">
      <v-card :loading="loading" max-width="600px" title="Pokebox">
        <v-divider />

        <v-list>
          <div v-if="savedPokemon.length > 0">
            <v-list-item
              v-for="(userPokemon, i) in savedPokemon"
              :key="i"
              :prepend-avatar="`/images/pokemon/${userPokemon.pokemon.name.toLowerCase()}.png`"
              :title="userPokemon.name"
              :subtitle="`Level ${userPokemon.level}`"
              :value="userPokemon"
              @click="selectPokemon(userPokemon)"
            ></v-list-item>
          </div>
          <div v-else class="text-center">No saved mons</div>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { UserService } from '@/services/user/user-service'
import type { PokemonInstanceExt } from 'sleepapi-common'

export default {
  name: 'PokeboxList',
  emits: ['save'],
  data: () => ({
    savedPokemon: [] as PokemonInstanceExt[],
    loading: false
  }),
  async mounted() {
    this.loading = true
    this.savedPokemon = await UserService.getUserPokemon()
    this.loading = false
  },
  methods: {
    selectPokemon(pokemonInstance: PokemonInstanceExt) {
      this.$emit('save', pokemonInstance)
    }
  }
}
</script>
