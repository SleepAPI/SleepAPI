<template>
  <v-card class="pa-4">
    <!-- Choose the subskill for level -->
    <v-row>
      <v-col cols="12" class="py-5">
        <div v-if="lowestAvailableLevel" style="height: 50px">
          <CustomLabel class="text-left-override">
            <v-badge location="right" color="primary" rounded="lg" :content="lowestAvailableLevel" offset-x="-15">
              <span>Choose the subskill for level</span>
            </v-badge>
          </CustomLabel>
        </div>
        <div v-else style="height: 50px">
          <CustomLabel> Click a selected subskill to replace it </CustomLabel>
        </div>
      </v-col>
    </v-row>

    <!-- Golden subskills -->
    <v-row dense>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.BERRY_FINDING_S"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.BERRY_FINDING_S)"
        />
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.HELPING_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.HELPING_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.ENERGY_RECOVERY_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.ENERGY_RECOVERY_BONUS)"
        />
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.SLEEP_EXP_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.SLEEP_EXP_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.DREAM_SHARD_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.DREAM_SHARD_BONUS)"
        />
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill="availableSubskills.RESEARCH_EXP_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.RESEARCH_EXP_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Helping Speed </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.HELPING_SPEED_S"
          :selected-subskills="selectedSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.HELPING_SPEED_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.HELPING_SPEED_M"
          :selected-subskills="selectedSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.HELPING_SPEED_M)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Ingredient Finder </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.INGREDIENT_FINDER_S"
          :selected-subskills="selectedSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.INGREDIENT_FINDER_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.INGREDIENT_FINDER_M"
          :selected-subskills="selectedSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.INGREDIENT_FINDER_M)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Skill Trigger </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_TRIGGER_S"
          :selected-subskills="selectedSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.SKILL_TRIGGER_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_TRIGGER_M"
          :selected-subskills="selectedSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.SKILL_TRIGGER_M)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Inventory Up </CustomLabel> </v-col>
      <v-col cols="2" class="flex-center pr-1 badge-col">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_S"
          :selected-subskills="selectedSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_S)"
        />
      </v-col>
      <v-col cols="2" class="flex-center pl-1 pr-1 badge-col">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_M"
          :selected-subskills="selectedSubskills"
          label="M"
          class="rounded-t-0 rounded-b-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_M)"
        />
      </v-col>
      <v-col cols="2" class="flex-center pl-1 badge-col">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_L"
          :selected-subskills="selectedSubskills"
          label="L"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_L)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6"> <CustomLabel> Skill Level Up </CustomLabel> </v-col>
      <v-col cols="3" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_LEVEL_UP_S"
          :selected-subskills="selectedSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.SKILL_LEVEL_UP_S)"
        />
      </v-col>
      <v-col cols="3" class="flex-center pl-1">
        <SubskillButton
          :subskill="availableSubskills.SKILL_LEVEL_UP_M"
          :selected-subskills="selectedSubskills"
          label="M"
          class="rounded-s-0"
          @click="toggleSubskill(availableSubskills.SKILL_LEVEL_UP_M)"
        />
      </v-col>
    </v-row>

    <v-row dense class="mt-3">
      <v-col cols="4">
        <v-btn class="w-100" size="large" rounded="lg" color="secondary" data-testid="cancel-button" @click="cancel"
          >Cancel</v-btn
        >
      </v-col>
      <v-col cols="4">
        <v-btn class="w-100" size="large" rounded="lg" color="surface" data-testid="clear-button" @click="clear"
          >Clear</v-btn
        >
      </v-col>
      <v-col cols="4">
        <v-btn
          class="w-100"
          size="large"
          rounded="lg"
          color="primary"
          data-testid="save-button"
          @click="updateSubskills"
          >Save</v-btn
        >
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import CustomLabel from '@/components/custom-components/custom-label.vue'
import SubskillButton from '@/components/pokemon-input/menus/subskill-button.vue'
import { type Subskill, type SubskillInstance } from 'sleepapi-common'

export default {
  name: 'SubskillMenu',
  components: { SubskillButton, CustomLabel },
  props: {
    currentSubskills: {
      type: Array<SubskillInstance>,
      required: true,
      default: []
    },
    availableSubskills: {
      type: Object,
      required: true
    }
  },
  emits: ['cancel', 'update-subskills'],
  data: () => ({
    selectedSubskills: [] as SubskillInstance[],
    availableLevels: [10, 25, 50, 70, 80]
  }),
  computed: {
    subskillName() {
      return (subskillLevel: number) => {
        return this.subskillForLevel(subskillLevel)?.name ?? '???'
      }
    },
    lowestAvailableLevel() {
      const usedLevels = this.selectedSubskills.map((s) => s.level)
      return this.availableLevels.find((level) => !usedLevels.includes(level))
    }
  },
  mounted() {
    // deep copy to avoid mutating the original subskills without even saving
    this.selectedSubskills = JSON.parse(JSON.stringify(this.currentSubskills))
  },
  methods: {
    subskillForLevel(subskillLevel: number): Subskill | undefined {
      return this.currentSubskills.find((subskillInstance) => subskillInstance.level === subskillLevel)?.subskill
    },
    toggleSubskill(ss: Subskill) {
      const index = this.selectedSubskills.findIndex((s) => s.subskill.name.toLowerCase() === ss.name.toLowerCase())

      if (index !== -1) {
        // Subskill is already selected, remove it
        this.selectedSubskills.splice(index, 1)
      } else {
        const availableLevel = this.lowestAvailableLevel

        if (availableLevel !== undefined) {
          this.selectedSubskills.push({ level: availableLevel, subskill: ss })
        }
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    clear() {
      this.selectedSubskills = []
    },
    updateSubskills() {
      this.$emit('update-subskills', this.selectedSubskills)
    }
  }
}
</script>

<style scoped>
.text-left-override :deep(.flex-center) {
  justify-content: flex-start !important;
  padding-left: 10px !important;
}

.badge-col:nth-child(2) {
  z-index: 3;
}
.badge-col:nth-child(3) {
  z-index: 2;
}
.badge-col:nth-child(4) {
  z-index: 1;
}
</style>
