<template>
  <v-container class="pt-12">
    <v-row class="align-center justify-center">
      <v-col cols="auto">
        <!-- <SneaselHomeIcon alt="Sleep API Logo" /> -->
        <v-skeleton-loader
          type="image"
          class="fill-height"
          style="
            max-width: min(200px, 50vw);
            min-height: 200px;
            width: 100%;
            min-width: 200px;
            border-radius: 50%;
            overflow: hidden;
          "
        ></v-skeleton-loader>
      </v-col>
      <v-col cols="auto" class="text-center text-lg-start">
        <h1 class="title text-h4 font-weight-medium mb-3">Pokémon Sleep Simulations</h1>
        <p class="mb-6 mx-auto text-center" style="max-width: 568px">
          Get started running your own simulation-based calculations with Sleep API's built-in data
          analysis.
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
        <v-card class="mx-auto" max-width="300" flat>
          <!-- <v-img :alt="feature.title" :aspect-ratio="2.6" :src="feature.src" width="100%" cover /> -->
          <v-skeleton-loader
            width="100%"
            :aspect-ratio="2.6"
            cover
            type="image"
          ></v-skeleton-loader>

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
    // TODO: bring back when we get avatar
    // eslint-disable-next-line vue/no-unused-components
    SneaselHomeIcon
  },
  data: () => ({
    features: [
      {
        description: "Simulate your Pokémon's production with in-depth data analysis.",
        title: 'Calculator',
        src: '',
        icon: 'mdi-square-root',
        to: ''
      },
      {
        description: 'Cooking tier lists based on millions of simulated recipe solutions.',
        title: 'Tier lists',
        src: '',
        icon: 'mdi-chart-line',
        to: ''
      },
      {
        description: 'Find the most optimal teams for any given recipe.',
        title: 'Team finder',
        src: '',
        icon: 'mdi-text-search-variant',
        to: ''
      }
    ]
  }),
  methods: {
    scrollTo(elementId: string) {
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }
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
