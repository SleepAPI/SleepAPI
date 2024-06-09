<template>
  <div class="circle">
    <img src="/images/sneasel/home.png" alt="Sleep API icon" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SneaselHomeIcon'
})
</script>

<style lang="scss">
@import '@/assets/colors';

.circle {
  max-width: min(300px, 75vw);
  width: 100%;
}

.circle img {
  max-width: 100%;
  height: auto;
}
</style>
