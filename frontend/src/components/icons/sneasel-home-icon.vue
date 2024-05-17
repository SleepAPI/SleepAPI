<template>
  <div class="circle">
    <img src="/cook.png" alt="Sleep API icon" />
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
  max-width: min(200px, 50vw);
  width: 100%;
  background-color: $secondary;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle img {
  max-width: 100%;
  height: auto;
}
</style>
