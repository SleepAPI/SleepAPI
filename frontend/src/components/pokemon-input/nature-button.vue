<template>
  <v-row id="nature">
    <v-col cols="6">
      <v-dialog id="natureDialog" v-model="natureMenu" max-width="550px">
        <template #activator="{ props }">
          <v-badge
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
      <div v-if="nature && !nature.prettyName.includes('neutral')">
        <div class="nowrap responsive-text">
          <span class="nowrap mr-1">{{ positiveStat }}</span>
          <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
          <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
        </div>
        <div class="nowrap responsive-text">
          <span class="nowrap mr-1">{{ negativeStat }}</span>
          <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
          <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
        </div>
      </div>
      <div v-else class="pr-2">
        <span class="flex-left responsive-text">This nature has no effect</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import NatureMenu from '@/components/pokemon-input/menus/nature-menu.vue'
import { nature } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'NatureButton',
  components: {
    NatureMenu
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
    },
    filteredNatures() {
      type Criteria = {
        [key: string]: (nat: nature.Nature) => boolean
      }
      const categories = ['Speed', 'Ingredient', 'Skill', 'Energy', 'EXP', 'Neutral']
      const criteria: Criteria = {
        Speed: (nat: nature.Nature) => nat.frequency > 1,
        Ingredient: (nat: nature.Nature) => nat.ingredient > 1,
        Skill: (nat: nature.Nature) => nat.skill > 1,
        Energy: (nat: nature.Nature) => nat.energy > 1,
        EXP: (nat: nature.Nature) => nat.exp > 1,
        Neutral: (nat: nature.Nature) => nat.prettyName.includes('neutral')
      }

      return categories.map((category) => {
        const filterFunction = criteria[category]
        const natures = nature.NATURES.filter(filterFunction)
        return { category, list: natures.map((s) => s.name) }
      })
    },
    positiveStat() {
      return this.getModifiedStat('positive')
    },
    negativeStat() {
      return this.getModifiedStat('negative')
    }
  },
  methods: {
    selectNature(nature: nature.Nature) {
      this.natureMenu = false
      this.$emit('update-nature', nature)
    },
    getModifiedStat(modifier: 'positive' | 'negative') {
      const modifiers: { [key: string]: { value: number; message: string } } = {
        frequency: { value: this.nature.frequency, message: 'Speed of help' },
        ingredient: { value: this.nature.ingredient, message: 'Ingredient finding' },
        skill: { value: this.nature.skill, message: 'Main skill chance' },
        energy: { value: this.nature.energy, message: 'Energy recovery' },
        exp: { value: this.nature.exp, message: 'EXP' }
      }

      for (const key in modifiers) {
        if (modifiers[key].value > 1 && modifier === 'positive') {
          return modifiers[key].message
        } else if (modifiers[key].value < 1 && modifier === 'negative') {
          return modifiers[key].message
        }
      }

      return 'This nature has no effect'
    }
  }
}
</script>

<style lang="scss">
.nowrap {
  display: flex;
  align-items: center;
}

.responsive-text {
  font-size: 0.875rem !important;
}

.responsive-icon {
  font-size: 0.875rem !important;
}

@media (max-width: 360px) {
  .responsive-text {
    font-size: 0.7rem !important;
  }

  .responsive-icon {
    font-size: 0.7rem !important;
  }
}
</style>
