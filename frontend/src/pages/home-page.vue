<template>
  <v-container class="pt-12 flex-center">
    <v-row v-if="isMobile" class="flex-center">
      <v-col cols="auto">
        <SneaselHomeIcon />
      </v-col>
      <v-col cols="auto" class="text-start text-lg-start mb-8">
        <h1 class="title text-h3 font-weight-bold mb-3">Neroli's Lab</h1>
        <p class="mx-auto text-center">Helping you overthink sleep tracking.</p>
        <p class="mb-6 mx-auto text-center">Optimize your strategies with our simulations.</p>

        <v-row class="flex-center">
          <v-col cols="10" class="flex-center">
            <v-btn
              class="w-100 fx01"
              title="Get started"
              height="50px"
              size="large"
              rounded="lg"
              aria-label="Get started"
              :to="'/calculator'"
              >Get started</v-btn
            >
          </v-col>
        </v-row>
      </v-col>

      <v-col v-for="(feature, i) in features" :key="i" cols="auto">
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
    <v-row v-else class="" style="max-width: 1000px">
      <v-row class="justify-space-between">
        <v-col cols="auto">
          <h1 class="title text-h1 font-weight-bold mb-3">Neroli's Lab</h1>
          <p class="text-h6 mx-auto text-left">Helping you overthink sleep tracking.</p>
          <p class="text-h6 mb-6 mx-auto text-left">Optimize your strategies with our simulations.</p>
          <v-btn
            class="w-100 fx01"
            title="Get started"
            height="50px"
            size="large"
            rounded="lg"
            aria-label="get started"
            :to="'/calculator'"
            >Get started</v-btn
          >
        </v-col>
        <v-col cols="auto">
          <SneaselHomeIcon />
        </v-col>
      </v-row>
      <v-row class="justify-space-between flex-nowrap">
        <v-col v-for="(feature, i) in features" :key="i" cols="auto">
          <v-card max-width="300" class="fill-height" :to="feature.to">
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
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SneaselHomeIcon from '@/components/icons/sneasel-home-icon.vue'
import { useViewport } from '@/composables/viewport-composable'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    SneaselHomeIcon
  },
  setup() {
    const { isMobile } = useViewport()
    return { isMobile }
  },
  data: () => ({
    features: [
      {
        description: "Calculate your team's or pokemon's production with our realistic Sleep API-powered simulations.",
        title: 'Calculator',
        src: '/images/misc/doctor4.png',
        icon: 'mdi-square-root',
        to: '/calculator'
      },
      {
        description: 'Compare your Pokémon to each other before deciding on your investments.',
        title: 'Compare',
        src: '/images/misc/doctor2.png',
        icon: 'mdi-compare-horizontal',
        to: '/compare'
      },
      {
        description: 'Cooking tier lists based on millions of simulated recipe solutions.',
        title: 'Tier lists',
        src: '/images/misc/doctor3.png',
        icon: 'mdi-chart-line',
        to: '/tierlist'
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

.fx01 {
  position: relative;
  color: white;
  background-color: $primary;
  overflow: hidden;
}

.fx01::after {
  content: '';
  position: absolute;
  top: -50px;
  left: -75px;
  width: 50px;
  height: 155px;
  background: #fff;
  opacity: 0.8;
  transform: rotate(35deg);
  z-index: 1;
  animation: lightSweep 7s cubic-bezier(0.175, 0.52, 0.165, 1) infinite;
  animation-delay: 7s;
}

@keyframes lightSweep {
  0% {
    left: -150%;
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  20% {
    left: 120%;
    opacity: 0;
  }
  100% {
    left: 120%;
    opacity: 0;
  }
}

.fx01:hover {
  background-color: $accent;
}
</style>
