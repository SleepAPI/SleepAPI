<template>
  <v-dialog v-model="dialogStore.scheduleDialog" max-width="900px" scrollable>
    <v-card v-if="slotIndex !== null" title="Schedule">
      <v-card-text>
        <v-select
          :model-value="scheduleType"
          class="mb-3"
          density="compact"
          hide-details
          item-title="title"
          item-value="value"
          :item-props="scheduleTypeItemProps"
          :items="scheduleTypes"
          label="Rotate by"
          :disabled="shifts.length === 0"
          @update:model-value="changeScheduleType"
        />
        <v-row class="schedule-row flex-nowrap" dense>
          <v-col
            v-for="shift in shifts"
            :key="`${shift.externalId}-${shift.startTime}`"
            class="schedule-tile"
            cols="auto"
          >
            <v-card class="fill-height frosted-glass" @click="selectedShift = shift">
              <v-img v-if="pokemonFor(shift.externalId)" :src="image(shift.externalId)" height="104" width="104" />
              <v-card-text v-if="scheduleType === 'time'" class="text-center pa-1">
                {{ shift.startTime }}
              </v-card-text>
            </v-card>
          </v-col>
          <v-col v-if="!limitedToTwo || shifts.length < 2" class="schedule-tile" cols="auto">
            <v-card class="fill-height frosted-glass d-flex align-center" height="136" width="112" @click="addPokemon">
              <v-icon class="w-100" color="secondary" size="44">mdi-plus</v-icon>
            </v-card>
          </v-col>
        </v-row>
        <template v-if="scheduleType === 'tasty-chance' || scheduleType === 'pot-size'">
          <p class="text-body-2 mt-4">
            {{
              scheduleType === 'tasty-chance'
                ? 'Rotate after accumulated Extra Tasty chance reaches the target.'
                : 'Rotate after cooking pot size reaches the target.'
            }}
          </p>
          <v-text-field
            v-model.number="conditionTarget"
            :label="scheduleType === 'tasty-chance' ? 'Extra Tasty chance %' : 'Pot size'"
            :max="scheduleType === 'tasty-chance' ? 70 : undefined"
            min="1"
            type="number"
          />
          <v-btn color="primary" size="small" @click="saveTargets">Save target</v-btn>
        </template>
      </v-card-text>
      <v-card-actions><v-btn @click="dialogStore.closeSchedule">Close</v-btn></v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="shiftMenu" max-width="360px">
    <v-card v-if="selectedShift" title="Scheduled Pokémon">
      <v-list>
        <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="editPokemon" />
        <v-list-item
          v-if="scheduleType === 'time'"
          prepend-icon="mdi-clock-outline"
          title="Change start time"
          @click="timePicker = true"
        />
        <v-list-item
          :disabled="shifts.length === 1"
          prepend-icon="mdi-delete"
          title="Remove from schedule"
          @click="removeShift"
        />
      </v-list>
    </v-card>
  </v-dialog>

  <v-dialog v-model="timePicker" max-width="400px">
    <v-card title="Select shift start time">
      <v-time-picker v-model="updatedTime" color="primary" format="24hr" :allowed-minutes="allowedStep" />
      <v-card-actions
        ><v-spacer /><v-btn @click="timePicker = false">Cancel</v-btn
        ><v-btn color="primary" @click="saveTime">Save</v-btn></v-card-actions
      >
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { avatarImage } from '@/services/utils/image-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import {
  CookingAssistSBulkUp,
  CookingPowerUpS,
  CookingPowerUpSMinus,
  TastyChanceS,
  type TeamScheduleShift,
  type TeamScheduleType
} from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

const dialogStore = useDialogStore()
const teamStore = useTeamStore()
const pokemonStore = usePokemonStore()
const selectedShift = ref<TeamScheduleShift | null>(null)
const timePicker = ref(false)
const updatedTime = ref<string | null>(null)
const conditionTarget = ref<number>(1)

const slotIndex = computed(() => dialogStore.scheduleSlotIndex)
const shifts = computed(() => (slotIndex.value === null ? [] : teamStore.getSchedule(slotIndex.value)))
const scheduleType = ref<TeamScheduleType>('time')
const limitedToTwo = computed(() => scheduleType.value === 'tasty-chance' || scheduleType.value === 'pot-size')
const primaryPokemon = computed(() => {
  const externalId = slotIndex.value === null ? undefined : teamStore.getCurrentTeam.members[slotIndex.value]
  return externalId ? pokemonFor(externalId) : undefined
})
const canUseTastyChance = computed(
  () => primaryPokemon.value?.pokemon.skill.is(TastyChanceS, CookingAssistSBulkUp) ?? false
)
const canUsePotSize = computed(
  () => primaryPokemon.value?.pokemon.skill.is(CookingPowerUpS, CookingPowerUpSMinus) ?? false
)
const scheduleTypes = computed(() => [
  { title: 'Time', value: 'time', disabled: false },
  { title: 'Extra tasty chance', value: 'tasty-chance', disabled: !canUseTastyChance.value },
  { title: 'Pot size', value: 'pot-size', disabled: !canUsePotSize.value }
])
const scheduleTypeItemProps = (item: { disabled: boolean }) => ({ disabled: item.disabled })
const shiftMenu = computed({
  get: () => selectedShift.value !== null,
  set: (open) => !open && (selectedShift.value = null)
})

watch(selectedShift, (shift) => {
  updatedTime.value = shift?.startTime ?? null
})
watch(
  shifts,
  (next) => {
    scheduleType.value = next[0]?.type === 'tasty-chance' || next[0]?.type === 'pot-size' ? next[0].type : 'time'
    conditionTarget.value = next[0]?.tastyChanceTarget ?? next[0]?.potSizeTarget ?? 1
  },
  { immediate: true }
)

const pokemonFor = (externalId: string) => pokemonStore.getPokemon(externalId)
const image = (externalId: string) => {
  const pokemon = pokemonFor(externalId)
  return pokemon ? avatarImage({ pokemonName: pokemon.pokemon.name, shiny: pokemon.shiny, happy: false }) : ''
}
const allowedStep = (minute: number) => minute % 5 === 0

const persist = async (targetSlotIndex: number, next: TeamScheduleShift[]) => {
  await teamStore.setSchedule(targetSlotIndex, next)
}
const changeScheduleType = async (type: TeamScheduleType) => {
  if ((type === 'tasty-chance' && !canUseTastyChance.value) || (type === 'pot-size' && !canUsePotSize.value)) return
  scheduleType.value = type
  const next = (limitedToTwo.value ? shifts.value.slice(0, 2) : shifts.value).map((shift, index) => ({
    ...shift,
    type,
    tastyChanceTarget: type === 'tasty-chance' && index === 0 ? (shift.tastyChanceTarget ?? 1) : undefined,
    potSizeTarget: type === 'pot-size' && index === 0 ? (shift.potSizeTarget ?? 1) : undefined
  }))
  if (slotIndex.value !== null) await persist(slotIndex.value, next)
}
const saveTargets = async () => {
  if (slotIndex.value === null) return
  await persist(
    slotIndex.value,
    shifts.value.map((shift, index) => ({
      ...shift,
      type: scheduleType.value,
      tastyChanceTarget:
        scheduleType.value === 'tasty-chance' && index === 0
          ? Math.min(70, Math.max(1, conditionTarget.value))
          : undefined,
      potSizeTarget: scheduleType.value === 'pot-size' && index === 0 ? conditionTarget.value : undefined
    }))
  )
}
const addPokemon = () => {
  if (limitedToTwo.value && shifts.value.length >= 2) return
  dialogStore.openPokemonSearch(async (pokemon) => {
    pokemonStore.upsertLocalPokemon(pokemon)
    const latest = shifts.value.at(-1)?.startTime ?? teamStore.getCurrentTeam.wakeup
    const [hour, minute] = latest.split(':').map(Number)
    const nextMinutes = (hour * 60 + minute + 5) % 1440
    await persist(slotIndex.value!, [
      ...shifts.value,
      {
        slotIndex: slotIndex.value!,
        externalId: pokemon.externalId,
        startTime: `${String(Math.floor(nextMinutes / 60)).padStart(2, '0')}:${String(nextMinutes % 60).padStart(2, '0')}`,
        type: scheduleType.value
      }
    ])
  })
}
const removeShift = async () => {
  if (!selectedShift.value || shifts.value.length === 1) return
  const shiftToRemove = selectedShift.value
  const targetSlotIndex = slotIndex.value
  const nextShifts = shifts.value.filter((shift) => shift !== shiftToRemove)
  selectedShift.value = null
  if (targetSlotIndex !== null) await persist(targetSlotIndex, nextShifts)
}
const saveTime = async () => {
  if (!selectedShift.value || !updatedTime.value) return
  if (shifts.value.some((shift) => shift !== selectedShift.value && shift.startTime === updatedTime.value)) return
  const shiftToUpdate = selectedShift.value
  const targetSlotIndex = slotIndex.value
  const nextShifts = shifts.value.map((shift) =>
    shift === shiftToUpdate ? { ...shift, startTime: updatedTime.value! } : shift
  )
  selectedShift.value = null
  timePicker.value = false
  if (targetSlotIndex !== null) await persist(targetSlotIndex, nextShifts)
}
const editPokemon = () => {
  const shift = selectedShift.value
  const pokemon = shift && pokemonFor(shift.externalId)
  if (!pokemon) return
  dialogStore.openPokemonInput(async (updated) => {
    pokemonStore.upsertLocalPokemon(updated)
    await teamStore.calculateProduction(teamStore.currentIndex)
  }, pokemon)
  selectedShift.value = null
}
</script>

<style scoped>
.schedule-row {
  overflow-x: auto;
  padding-bottom: 8px;
}
.schedule-tile {
  min-width: 112px;
}
</style>
