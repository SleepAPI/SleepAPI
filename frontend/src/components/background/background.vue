<template>
  <div class="blur">
    <div class="triangle-top"></div>
    <div class="triangle-bottom"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TheBackground'
})
</script>

<style lang="scss">
.triangle-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 30vw;
  height: 50vh;
  background: rgba(230, 57, 70, 0.22);
  clip-path: polygon(0% 0%, 0% 100%, 100% 0%);
}
.triangle-bottom {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30vw;
  height: 50vh;
  background: rgba(230, 57, 70, 0.22);
  clip-path: polygon(0% 100%, 100% 100%, 100% 0%);
}

.blur {
  background: rgba(255, 255, 255, 0.02);
  height: 100dvh;
  width: 100%;
  position: absolute;
  filter: blur(128px);
  -webkit-filter: blur(128px);
  -moz-filter: blur(128px);
  -o-filter: blur(128px);
  -ms-filter: blur(128px);
  overflow: hidden;
}
</style>
