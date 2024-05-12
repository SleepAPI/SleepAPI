<template>
  <div class="content-container">
    <div class="circle">
      <img src="@/assets/images/cook.png" alt="Sleep API icon" />
    </div>
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
  max-width: 300px;
  height: 300px;
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
