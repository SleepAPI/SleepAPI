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

.content-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.circle img {
  width: 100%;
  height: auto;
  max-height: 100%;
}

.circle {
  background-color: $secondary;
  border-radius: 50%;
  overflow: hidden;
}
</style>
