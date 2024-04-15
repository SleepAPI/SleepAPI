<template>
  <main>
    <v-container>
      <v-row class="flex-nowrap">
        <v-col v-for="n in 5" :key="n" flex="1" style="padding: 4px 4px">
          <InputCard />
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import InputCard from '@/components/calculator/input-card.vue'

export default defineComponent({
  components: {
    InputCard
  }
})
</script>

<style lang="scss" scoped></style>
