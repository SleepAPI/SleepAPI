<template>
  <v-card class="pa-4">
    <v-row>
      <v-col cols="12" class="py-5">
        <div v-if="lowestAvailableLevel" style="height: 50px">
          <CustomLabel>
            <v-badge location="right center" color="primary" rounded="lg" :content="lowestAvailableLevel">
              <v-container>
                <span>Choose the subskill for level</span>
              </v-container>
            </v-badge>
          </CustomLabel>
        </div>
        <div v-else style="height: 50px">
          <CustomLabel> Click on a selected subskill to replace it </CustomLabel>
        </div>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <SubskillButton
          :subskill="availableSubskills.BERRY_FINDING_S"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.BERRY_FINDING_S)"
        />
      </v-col>
      <v-col cols="6">
        <SubskillButton
          :subskill="availableSubskills.HELPING_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.HELPING_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6">
        <SubskillButton
          :subskill="availableSubskills.ENERGY_RECOVERY_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.ENERGY_RECOVERY_BONUS)"
        />
      </v-col>
      <v-col cols="6">
        <SubskillButton
          :subskill="availableSubskills.SLEEP_EXP_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.SLEEP_EXP_BONUS)"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6">
        <SubskillButton
          :subskill="availableSubskills.DREAM_SHARD_BONUS"
          :selected-subskills="selectedSubskills"
          @click="toggleSubskill(availableSubskills.DREAM_SHARD_BONUS)"
        />
      </v-col>
      <v-col cols="6">
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
      <v-col cols="2" class="flex-center pr-1">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_S"
          :selected-subskills="selectedSubskills"
          label="S"
          class="rounded-e-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_S)"
        />
      </v-col>
      <v-col cols="2" class="flex-center pl-1 pr-1">
        <SubskillButton
          :subskill="availableSubskills.INVENTORY_M"
          :selected-subskills="selectedSubskills"
          label="M"
          class="rounded-t-0 rounded-b-0"
          @click="toggleSubskill(availableSubskills.INVENTORY_M)"
        />
      </v-col>
      <v-col cols="2" class="flex-center pl-1">
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
      <v-col cols="4">
        <v-btn
          class="w-100 responsive-text"
          size="large"
          rounded="lg"
          color="surface"
          data-testid="clear-button"
          @click="clear"
          >Clear</v-btn
        >
      </v-col>
      <v-col cols="4">
        <v-btn
          class="w-100 responsive-text"
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
import { type Subskill, type SubskillInstanceExt } from 'sleepapi-common'

export default {
  name: 'SubskillMenu',
  components: { SubskillButton, CustomLabel },
  props: {
    currentSubskills: {
      type: Array<SubskillInstanceExt>,
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
    selectedSubskills: [] as SubskillInstanceExt[],
    availableLevels: [10, 25, 50, 75, 100]
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
    this.selectedSubskills = this.currentSubskills
  },
  methods: {
    subskillForLevel(subskillLevel: number): Subskill | undefined {
      return this.currentSubskills.find((ssExt) => ssExt.level === subskillLevel)?.subskill
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
