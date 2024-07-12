<template>
  <v-row id="subskills" dense class="mt-3">
    <v-col
      v-for="subskillLevel in subskillLevels"
      :key="subskillLevel"
      cols="6"
      class="flex-center"
    >
      <v-badge
        color="secondary"
        class="w-100"
        location="top left"
        offset-x="auto"
        :offset-y="-5"
        :model-value="locked(subskillLevel)"
      >
        <template #badge>
          <v-icon left class="mr-1">mdi-lock</v-icon>
          Lv.{{ subskillLevel }}
        </template>

        <v-btn
          :color="rarityColor(subskillLevel)"
          class="w-100"
          rounded="lg"
          height="36px"
          style="font-size: xx-small"
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
import SubskillMenu from '@/components/calculator/menus/subskill-menu.vue'
import { capitalize, subskill, type SubskillInstanceExt } from 'sleepapi-common'

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
      type: Array<SubskillInstanceExt>,
      required: true,
      default: () => []
    }
  },
  emits: ['update-subskills'],
  data: () => ({
    subskillMenu: false,
    subskillOptions: subskill.SUBSKILLS,
    subskillLevels: [10, 25, 50, 75, 100]
  }),
  computed: {
    rarityColor() {
      return (subskillLevel: number) => {
        const maybeSubskill = this.subskillForLevel(subskillLevel)
        if (!maybeSubskill) {
          return undefined
        } else {
          return `subskill${capitalize(maybeSubskill.rarity)}`
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
    subskillForLevel(subskillLevel: number): subskill.SubSkill | undefined {
      return this.selectedSubskills.find((ssExt) => ssExt.level === subskillLevel)?.subskill
    },
    updateSubskills(updatedSubskills: SubskillInstanceExt[]) {
      this.toggleSubskillMenu()
      this.$emit('update-subskills', updatedSubskills)
    },
    toggleSubskillMenu() {
      this.subskillMenu = !this.subskillMenu
    }
  }
}
</script>
