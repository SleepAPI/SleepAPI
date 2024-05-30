<template>
  <v-container class="pt-12">
    <v-row class="flex-center">
      <v-col cols="auto">
        <SneaselHomeIcon />
      </v-col>
      <v-col cols="auto" class="text-center text-lg-start">
        <h1 class="title text-h4 font-weight-medium mb-3">Pokémon Sleep Simulations</h1>
        <p class="mb-6 mx-auto text-center">
          Run your own simulation-based calculations with Sleep API's built-in data analysis.
        </p>

        <v-row class="align-center justify-center">
          <v-col cols="auto" class="align-center justify-center px-1">
            <v-btn
              class="responsive-button"
              size="large"
              rounded="lg"
              color="primary"
              :to="'/calculator'"
              >Get started</v-btn
            >
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <v-container>
    <v-row justify="center">
      <v-col v-for="(feature, i) in features" :key="i" class="d-flex flex-shrink-1" cols="auto">
        <v-card max-width="300" :to="feature.to">
          <v-img :src="feature.src" :aspect-ratio="2" width="100%" cover></v-img>

          <v-card-text>
            <div class="d-flex">
              <v-icon class="mr-2">{{ feature.icon }}</v-icon>
              <h3 class="text-subheading-1 font-weight-bold mb-2">
                {{ feature.title }}
              </h3>
            </div>
            <p class="mb-2">{{ feature.description }}</p>
          </v-card-text>

          <v-card-actions> </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SneaselHomeIcon from '@/components/icons/sneasel-home-icon.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    SneaselHomeIcon
  },
  data: () => ({
    features: [
      {
        description: "Simulate your Pokémon's production with in-depth data analysis.",
        title: 'Calculator',
        src: '/images/home-page/calculator.png',
        icon: 'mdi-square-root',
        to: '/calculator'
      },
      {
        description: 'Cooking tier lists based on millions of simulated recipe solutions.',
        title: 'Tier lists',
        src: '/images/home-page/tierlists.png',
        icon: 'mdi-chart-line',
        to: '/tierlist'
      },
      {
        description: 'Find the most optimal teams for any given recipe.',
        title: 'Team finder',
        src: '/images/home-page/teamfinder.png',
        icon: 'mdi-text-search-variant',
        to: '/teamfinder'
      }
    ]
  })
})
</script>

<style lang="scss">
@import '@/assets/colors.scss';

.title {
  text-align: center;
  font-weight: 600;
  line-height: 120%;
}

.sub-title {
  text-align: center;
  font-weight: 500;
  line-height: 120%;
}

.responsive-button {
  width: 200px;
}

@media (max-width: 450px) {
  .responsive-button {
    width: 150px;
  }
}
</style>
