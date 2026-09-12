<template>
  <v-row id="subskills" dense>
    <v-col v-for="subskillLevel in subskillLevels" :key="subskillLevel" cols="6" class="flex-center">
      <v-badge
        id="subskillBadge"
        color="secondary"
        class="w-100"
        location="top left"
        offset-x="auto"
        :offset-y="-2"
        :model-value="locked(subskillLevel)"
      >
        <template #badge>
          <v-icon left class="mr-1">mdi-lock</v-icon>
          Lv.{{ subskillLevel }}
        </template>

        <v-btn
          :color="maybeRarityColor(subskillLevel)"
          class="w-100 text-x-small"
          rounded="xs"
          height="36px"
          @click="toggleSubskillMenu"
        >
          {{ subskillName(subskillLevel) }}
        </v-btn>
      </v-badge>
    </v-col>
  </v-row>

  <v-dialog id="subskillDialog" v-model="subskillMenu" max-width="550px">
    <SubskillMenu
      :current-subskills="selectedSubskills"
      :available-subskills="availableSubskills"
      @update-subskills="updateSubskills"
      @cancel="toggleSubskillMenu"
    />
  </v-dialog>
</template>

<script lang="ts">
import SubskillMenu from '@/components/pokemon-input/menus/subskill-menu.vue'
import { rarityColor } from '@/services/utils/color-utils'
import { subskill, type Subskill, type SubskillInstance } from 'sleepapi-common'

export default {
  name: 'SubskillButtons',
  components: {
    SubskillMenu
  },
  props: {
    pokemonLevel: {
      type: Number,
      required: true
    },
    selectedSubskills: {
      type: Array<SubskillInstance>,
      required: true,
      default: () => []
    }
  },
  emits: ['update-subskills'],
  data: () => ({
    subskillMenu: false,
    subskillOptions: subskill.SUBSKILLS,
    subskillLevels: [10, 25, 50, 70, 80]
  }),
  computed: {
    maybeRarityColor() {
      return (subskillLevel: number) => {
        const maybeSubskill = this.subskillForLevel(subskillLevel)
        if (!maybeSubskill) {
          return undefined
        } else {
          return rarityColor(maybeSubskill)
        }
      }
    },
    locked() {
      return (subskillLevel: number) => {
        return this.pokemonLevel < subskillLevel
      }
    },
    subskillName() {
      return (subskillLevel: number) => {
        return this.subskillForLevel(subskillLevel)?.name ?? '???'
      }
    },
    availableSubskills() {
      return subskill
    }
  },
  methods: {
    subskillForLevel(subskillLevel: number): Subskill | undefined {
      return this.selectedSubskills.find((subskillInstance) => subskillInstance.level === subskillLevel)?.subskill
    },
    updateSubskills(updatedSubskills: SubskillInstance[]) {
      this.toggleSubskillMenu()
      this.$emit('update-subskills', updatedSubskills)
    },
    toggleSubskillMenu() {
      this.subskillMenu = !this.subskillMenu
    }
  }
}
</script>

<style lang="scss">
#subskillBadge .v-badge__badge {
  max-height: 13px;
}
</style>
