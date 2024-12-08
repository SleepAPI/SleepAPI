<template>
  <v-card class="d-flex justify-center align-center fill-height w-100" elevation="0" color="secondary">
    <v-divider vertical class="ps-2 border-opacity-100" color="surface" :thickness="8" />
    <span class="d-flex w-100 align-center justify-center text-center" style="font-size: small">
      <slot></slot>
    </span>
  </v-card>
</template>

<script lang="ts">
export default {
  name: 'CustomLabel'
}
</script>
