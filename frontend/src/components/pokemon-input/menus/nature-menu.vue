<template>
  <v-card class="pa-4">
    <v-row>
      <v-col cols="12" style="height: 75px">
        <CustomLabel>
          <v-container class="text-body-2">
            <span>Click on a </span>
            <span class="text-natureUp font-weight-bold">positive</span>
            <span> and </span>
            <span class="text-natureDown font-weight-bold">negative</span>
            <span> modifier </span>
          </v-container>
        </CustomLabel>
      </v-col>
    </v-row>

    <v-row class="pt-0 mt-0">
      <v-col cols="6" class="flex-center">
        <v-icon color="secondary"> mdi-arrow-down-bold </v-icon>
      </v-col>
      <v-col cols="6" class="flex-center">
        <v-icon color="secondary"> mdi-arrow-down-bold </v-icon>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="positiveModifier === 'speed' ? 'bg-primary' : 'bg-secondary'"
          @click="changePositiveModifier('speed')"
        >
          <span class="mr-1"> Speed of help </span>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="negativeModifier === 'speed' ? 'bg-primary' : 'bg-secondary'"
          @click="changeNegativeModifier('speed')"
        >
          <span class="mr-1"> Speed of help </span>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="positiveModifier === 'ingredient' ? 'bg-primary' : 'bg-secondary'"
          @click="changePositiveModifier('ingredient')"
        >
          <span class="mr-1 ingredient-text"> Ingredient </span>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="negativeModifier === 'ingredient' ? 'bg-primary' : 'bg-secondary'"
          @click="changeNegativeModifier('ingredient')"
        >
          <span class="mr-1 ingredient-text"> Ingredient </span>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="positiveModifier === 'skill' ? 'bg-primary' : 'bg-secondary'"
          @click="changePositiveModifier('skill')"
        >
          <span class="mr-1"> Skill chance </span>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="negativeModifier === 'skill' ? 'bg-primary' : 'bg-secondary'"
          @click="changeNegativeModifier('skill')"
        >
          <span class="mr-1"> Skill chance </span>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="positiveModifier === 'energy' ? 'bg-primary' : 'bg-secondary'"
          @click="changePositiveModifier('energy')"
        >
          <span class="mr-1 energy-text"> Energy </span>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="negativeModifier === 'energy' ? 'bg-primary' : 'bg-secondary'"
          @click="changeNegativeModifier('energy')"
        >
          <span class="mr-1 energy-text"> Energy </span>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="positiveModifier === 'exp' ? 'bg-primary' : 'bg-secondary'"
          @click="changePositiveModifier('exp')"
        >
          <span class="mr-1"> EXP </span>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
          <v-icon color="natureUp" class="responsive-icon">mdi-triangle</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          class="w-100 text-body-2"
          :class="negativeModifier === 'exp' ? 'bg-primary' : 'bg-secondary'"
          @click="changeNegativeModifier('exp')"
        >
          <span class="mr-1"> EXP </span>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
          <v-icon color="natureDown" class="responsive-icon">mdi-triangle-down</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" class="flex-center">
        <v-btn
          class="w-50 text-body-2"
          :class="negativeModifier === 'neutral' && positiveModifier === 'neutral' ? 'bg-primary' : 'bg-secondary'"
          @click="setNeutralNature"
          >Neutral</v-btn
        >
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="5" class="w-100 flex-center">
        <v-divider></v-divider>
      </v-col>
      <v-col cols="2" class="w-100 flex-center"> or </v-col>
      <v-col cols="5" class="w-100 flex-center">
        <v-divider></v-divider>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12">
        <v-sheet color="secondary" rounded height="100px" style="overflow-y: auto">
          <v-chip-group v-if="filteredNatures.length > 0" v-model="selectedNature" column selected-class="bg-primary">
            <v-chip
              v-for="nature in filteredNatures"
              :key="nature.name"
              :value="nature"
              class="ma-1"
              @click="toggleChip(nature)"
            >
              {{ nature.name }}
            </v-chip>
          </v-chip-group>
          <v-container v-else class="flex-center"> No matching natures </v-container>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row dense class="mt-3">
      <v-col cols="6">
        <v-btn
          class="w-100 responsive-text"
          size="large"
          rounded="lg"
          color="secondary"
          data-testid="cancel-button"
          @click="cancel"
          >Cancel</v-btn
        >
      </v-col>
      <v-col cols="6">
        <v-btn
          class="w-100 responsive-text"
          size="large"
          rounded="lg"
          color="primary"
          :disabled="!selectedNature"
          data-testid="save-button"
          @click="save"
          >Save</v-btn
        >
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import CustomLabel from '@/components/custom-components/custom-label.vue'
import { nature } from 'sleepapi-common'

export default {
  name: 'NatureMenu',
  components: { CustomLabel },
  emits: ['cancel', 'update-nature'],
  data: () => ({
    natures: nature.NATURES,
    selectedNature: undefined as nature.Nature | undefined,
    positiveModifier: undefined as nature.NatureModifier | undefined,
    negativeModifier: undefined as nature.NatureModifier | undefined
  }),
  computed: {
    filteredNatures() {
      return this.natures.filter(
        (nat) =>
          (!this.positiveModifier || nat.positiveModifier === this.positiveModifier) &&
          (!this.negativeModifier || nat.negativeModifier === this.negativeModifier)
      )
    }
  },
  methods: {
    setNeutralNature() {
      this.selectedNature = nature.BASHFUL
      this.positiveModifier = 'neutral'
      this.negativeModifier = 'neutral'
    },
    toggleChip(toggled: nature.Nature) {
      if (toggled !== this.selectedNature) {
        this.positiveModifier = toggled.positiveModifier
        this.negativeModifier = toggled.negativeModifier
      } else {
        this.positiveModifier = undefined
        this.negativeModifier = undefined
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    save() {
      if (this.selectedNature) {
        this.$emit('update-nature', this.selectedNature)
      }
    },
    changePositiveModifier(newModifier: nature.NatureModifier) {
      if (this.positiveModifier !== newModifier && newModifier !== this.negativeModifier) {
        this.positiveModifier = newModifier
        if (this.positiveModifier && this.negativeModifier) {
          this.selectedNature = this.filteredNatures[0]
        }
      } else if (newModifier === this.negativeModifier) {
        this.positiveModifier = newModifier
        this.negativeModifier = undefined
        this.selectedNature = undefined
      } else {
        this.positiveModifier = undefined
        this.selectedNature = undefined
      }
    },
    changeNegativeModifier(newModifier: nature.NatureModifier) {
      if (newModifier !== this.negativeModifier && newModifier !== this.positiveModifier) {
        this.negativeModifier = newModifier
        if (this.positiveModifier && this.negativeModifier) {
          this.selectedNature = this.filteredNatures[0]
        }
      } else if (newModifier === this.positiveModifier) {
        this.negativeModifier = newModifier
        this.positiveModifier = undefined
        this.selectedNature = undefined
      } else {
        this.negativeModifier = undefined
        this.selectedNature = undefined
      }
    }
  }
}
</script>

<style scoped>
@media (min-width: 400px) {
  .ingredient-text::after {
    content: 'finding';
  }
  .energy-text::after {
    content: 'recovery';
  }
  .ingredient-text::before,
  .energy-text::before {
    content: '';
  }
}
</style>
