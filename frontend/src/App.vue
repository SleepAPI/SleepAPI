<script setup lang="ts">
import TheContent from '@/components/TheContent.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheNavbar from '@/components/TheNavbar.vue'
</script>

<template>
  <TheNavbar />

  <header>
    <img alt="Sleep API logo" class="logo" src="/cook.png" width="125" height="125" />

    <div class="wrapper">
      <TheHeader msg="Produce calculator" />
    </div>
  </header>

  <main class="divider">
    <TheContent />
  </main>
</template>

<style lang="scss" scoped>
@import '@/assets/global';

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto;
}

header,
main {
  padding: 2rem;
}

@media (min-width: $desktop) {
  header {
    display: flex;
    place-items: center;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
    padding: 0 2rem;
  }

  .divider {
    border-left: 1px solid $border;
  }
}
</style>
