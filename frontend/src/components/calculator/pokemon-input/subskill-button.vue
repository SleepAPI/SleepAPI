<template>
  <v-badge
    color="secondary"
    class="w-100"
    location="top left"
    offset-x="auto"
    :offset-y="-5"
    :model-value="locked"
  >
    <template #badge>
      <v-icon left class="mr-1">mdi-lock</v-icon>
      Lv.{{ subskillLevel }}
    </template>

    <v-dialog id="subskillDialog" v-model="subskillMenu" max-width="550px">
      <template #activator="{ props }">
        <v-btn
          :color="rarityColor"
          class="w-100"
          rounded="lg"
          height="36px"
          style="font-size: xx-small"
          v-bind="props"
          stacked
          @click="subskillMenu = true"
        >
          {{ subskillName }}
        </v-btn>
      </template>

      <v-card>
        <GroupList
          :data="filteredSubskills"
          :selected-options="selectedSubskills.map((s) => s.subskill.name)"
          @select-option="selectSubskill"
        />
      </v-card>
    </v-dialog>
  </v-badge>
</template>

<script lang="ts">
import GroupList from '@/components/custom-components/group-list.vue'
import { capitalize, subskill, type SubskillInstanceExt } from 'sleepapi-common'

export default {
  name: 'SubskillButton',
  components: {
    GroupList
  },
  props: {
    subskillLevel: {
      type: Number,
      required: true
    },
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
  emits: ['update-subskill'],
  data: () => ({
    subskillMenu: false,
    subskillOptions: subskill.SUBSKILLS
  }),
  computed: {
    rarityColor() {
      if (!this.thisSubskill) {
        return undefined
      } else {
        return `subskill${capitalize(this.thisSubskill.rarity)}`
      }
    },
    locked() {
      return this.pokemonLevel < this.subskillLevel
    },
    thisSubskill(): subskill.SubSkill | undefined {
      return this.selectedSubskills.find((ssExt) => ssExt.level === this.subskillLevel)?.subskill
    },
    subskillName() {
      return this.thisSubskill?.name ?? '???'
    },
    filteredSubskills() {
      const categories = ['Gold', 'Helping Speed', 'Ingredient', 'Inventory', 'Skill']

      return categories.map((category) => {
        const subskills = this.subskillOptions.filter((subskill) =>
          category === 'Gold'
            ? subskill.rarity === 'gold'
            : subskill.name.toLowerCase().includes(category.toLowerCase())
        )
        return { category, list: subskills.map((s) => s.name) }
      })
    }
  },
  methods: {
    selectSubskill(name: string) {
      const subskill = this.subskillOptions.find((s) => s.name === name)
      if (!subskill) {
        console.error('Error selecting subskill')
        return
      }
      this.subskillMenu = false
      this.$emit('update-subskill', { subskill, subskillLevel: this.subskillLevel })
    }
  }
}
</script>
