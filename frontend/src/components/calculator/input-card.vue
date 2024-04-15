<template>
  <v-card :loading="loading" class="fill-height" @click="openDetailsDialog">
    <template #loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="white"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>

    <div class="image-container">
      <v-img :src="imageUrl" :lazy-src="imageUrl" class="image-zoom"></v-img>
    </div>
    <v-divider></v-divider>
    <v-card-text class="text-center">{{ ingredientPercentage }}%</v-card-text>

    <InputDetails
      :show="showSelectDialog"
      @update-selected="updateSelected"
      @close-dialog="closeDetailsDialog"
    ></InputDetails>
  </v-card>
</template>

<script lang="ts">
import InputDetails from '@/components/calculator/input-details.vue'
import { InputCardService } from '@/services/calculator/input-card-service'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InputCard',
  components: {
    InputDetails
  },
  data: () => ({
    loading: false,
    showSelectDialog: false,
    selected: 'Pinsir',
    ingredientPercentage: 0,
    imageUrl: 'https://archives.bulbagarden.net/media/upload/9/90/0215Sneasel-Hisui.png' // default image
  }),
  methods: {
    fetch() {
      this.loading = true
      setTimeout(() => (this.loading = false), 2000)
    },
    openDetailsDialog() {
      this.showSelectDialog = true
    },
    closeDetailsDialog() {
      this.showSelectDialog = false
    },
    async updateSelected(option: string) {
      this.selected = option
      this.loading = true

      await InputCardService.fetchCardImage(option).then((imageUrl) => {
        this.imageUrl = imageUrl
        this.loading = false
      })

      const pokemonData = await InputCardService.fetchPokemonData(option)
      this.ingredientPercentage = pokemonData.ingredientPercentage
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/colors';

.image-container {
  overflow: hidden;
  aspect-ratio: 1 / 2;
  position: relative;
  cursor: pointer;
}

.image-zoom {
  transform: scale(2);
  transition: transform 0.3s ease-in-out;
  object-fit: cover;
  height: 100%; /* Make image fill the container */
  width: 100%; /* Stretch image to cover the width fully */
}

.image-container:hover .image-zoom {
  transform: scale(2.2); /* Zoom in the image */
}
</style>
