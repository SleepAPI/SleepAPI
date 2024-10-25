<template>
  <v-row id="nature">
    <v-col cols="6">
      <v-dialog id="natureDialog" v-model="natureMenu" max-width="550px">
        <template #activator="{ props }">
          <v-badge
            id="natureBadge"
            color="primary"
            content="Nature"
            location="top left"
            :offset-x="35"
            class="w-100"
          >
            <v-btn class="responsive-text w-100" v-bind="props" size="large" rounded="pill">{{
              natureName
            }}</v-btn>
          </v-badge>
        </template>

        <NatureMenu
          :current-nature="nature"
          @update-nature="selectNature"
          @cancel="natureMenu = false"
        />
      </v-dialog>
    </v-col>

    <v-col cols="6" class="flex-colum px-0" style="align-content: center">
      <NatureModifiers :nature="nature" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import NatureMenu from '@/components/pokemon-input/menus/nature-menu.vue'
import NatureModifiers from '@/components/pokemon-input/nature-modifiers.vue'
import { nature } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'NatureButton',
  components: {
    NatureMenu,
    NatureModifiers
  },
  props: {
    nature: {
      type: Object as PropType<nature.Nature>,
      required: true
    }
  },
  emits: ['update-nature'],
  data: () => ({
    natureMenu: false
  }),
  computed: {
    natureName() {
      return this.nature.name
    }
  },
  methods: {
    selectNature(nature: nature.Nature) {
      this.natureMenu = false
      this.$emit('update-nature', nature)
    }
  }
}
</script>

<style lang="scss">
#natureBadge .v-badge__badge {
  max-height: 13px;
}
</style>
