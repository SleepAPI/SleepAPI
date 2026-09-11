<template>
  <div class="w-100 fill-height transparent">
    <v-card
      :loading="false"
      :color="backgroundColor"
      class="w-100 fill-height rounded-b-0"
      :class="{ 'frosted-glass': !backgroundColor }"
      @click="$emit('click')"
    >
      <div class="text-center vertical-text">{{ name }}</div>
      <v-img :src="imageUrl" :alt="name" class="pokemon-image" data-testid="pokemon-image" />
      <div class="slot-footer">
        <v-card class="text-center text-x-small rounded-t-0" :color="badgeColor" location="bottom center">
          {{ badge }}
        </v-card>
        <slot name="footer" />
      </div>
    </v-card>
    <v-card class="level-card text-center text-x-small text-no-wrap" rounded="lg" color="primary" location="top center">
      {{ level }}
    </v-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  imageUrl: string | undefined
  level: string
  badge: string
  badgeColor: string
  backgroundColor?: string
}>()
defineEmits<{ click: [] }>()
</script>

<style lang="scss" scoped>
.transparent {
  background: rgba($surface, 0) !important;
}
.pokemon-image {
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  left: 10%;
}
.vertical-text {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  color: rgba(white, 0.6) !important;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  white-space: nowrap;
  text-align: center;
}
.slot-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}
.level-card {
  position: absolute;
  top: 0;
  width: 80%;
}
</style>
