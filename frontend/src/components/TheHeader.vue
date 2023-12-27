<script setup lang="ts">
import DocumentationIcon from './icons/IconDocumentation.vue'

defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <h1>{{ msg }}</h1>
    <h3>
      Calculate a Pokémon's output per meal window
      <a class="" href="https://vuejs.org/" target="_blank" rel="noopener"
        >show more <DocumentationIcon
      /></a>
    </h3>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/colors';

.greetings h1 {
  text-align: center;
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
  color: $sneasel-feather;
}

.greetings h3 {
  text-align: center;
  font-size: 1.2rem;
}

a {
  text-align: center;
  color: $sneasel-skin;
  &:hover {
    background-color: $sneasel-skin-background;
  }
}

@media (min-width: $desktop) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
