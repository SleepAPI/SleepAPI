<template>
  <div class="speech-bubble pb-2">
    <slot name="header-text">
      <v-row no-gutters class="flex-start flex-nowrap text-no-wrap">
        <v-col cols="auto" class="mx-1">
          <span class="text-black text-left">Lv.{{ pokemonInstance.level }}</span>
        </v-col>
        <v-col>
          <span :class="[`text-primary`, 'font-weight-medium']">{{ pokemonInstance.name }}</span>
        </v-col>
      </v-row>
    </slot>

    <v-row class="flex-start" no-gutters>
      <v-col cols="10" class="flex-start">
        <v-divider color="black" :thickness="2" />
      </v-col>
    </v-row>

    <v-row no-gutters class="flex-center">
      <v-col cols="12" class="flex-center">
        <slot name="body-text"></slot>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type PokemonInstanceExt } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'SpeechBubble',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main';

.speech-bubble {
  position: relative;
  background: $subskill-white;
  border-radius: 15px;
  max-height: 100%;
  max-width: 100%;
  height: auto;
  width: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 5px;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  left: 99%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent transparent $subskill-white;
}
</style>
