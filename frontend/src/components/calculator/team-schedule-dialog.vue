<template>
  <v-dialog
    :model-value="dialogStore.scheduleDialog"
    max-width="900px"
    scrollable
    @update:model-value="!$event && closeSchedule()"
  >
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
          :disabled="saving || shifts.length === 0"
          @update:model-value="changeScheduleType"
        />
        <v-row
          :inert="saving"
          class="schedule-row flex-nowrap"
          :class="{ 'schedule-row-timed': scheduleType === 'time' }"
          dense
        >
          <v-col
            v-for="{ shift, pokemon, subskillBadge } in scheduleTiles"
            :key="`${shift.externalId}-${shift.startTime}`"
            class="schedule-tile"
            cols="auto"
          >
            <PokemonSlotDisplay
              v-if="pokemon"
              :name="pokemon.name"
              :image-url="image(shift.externalId)"
              :level="`Level ${pokemon.level}`"
              :badge="subskillBadge"
              badge-color="subskillGold"
              @click="selectedShift = shift"
            />
            <v-btn
              v-if="scheduleType === 'time'"
              class="schedule-time-button"
              color="primary"
              :aria-label="`Edit shift start time for ${pokemon?.name ?? 'Pokemon'}: ${shift.startTime}`"
              :disabled="saving"
              @click="openTimePicker(shift)"
              >{{ shift.startTime }}</v-btn
            >
          </v-col>
          <v-col v-if="!limitedToTwo || shifts.length < 2" class="schedule-tile schedule-add-slot" cols="auto">
            <v-card class="schedule-add-card w-100 fill-height frosted-glass d-flex align-center" @click="addPokemon">
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
            id="rotationTarget"
            v-model="conditionTarget"
            :label="scheduleType === 'tasty-chance' ? 'Extra Tasty chance %' : 'Pot size'"
            :inputmode="scheduleType === 'tasty-chance' ? 'decimal' : 'numeric'"
            :error-messages="targetError"
            :loading="saving"
            @keydown.enter.prevent="saveTarget"
            @blur="saveTarget"
            type="text"
          />
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn class="text-body" size="large" rounded="lg" color="primary" @click="closeSchedule">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="shiftMenu" max-width="360px">
    <v-card v-if="selectedShift" title="Scheduled Pokémon">
      <v-list>
        <v-list-item prepend-icon="mdi-pencil" :disabled="saving" title="Edit" @click="editPokemon" />
        <v-list-item
          id="schedule-pokebox-button"
          :disabled="saving || !userStore.loggedIn"
          :prepend-icon="selectedPokemon?.saved ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"
          @click="togglePokebox"
          >{{ selectedPokemon?.saved ? 'Remove from Pokebox' : 'Save to Pokebox' }}</v-list-item
        >
        <v-list-item
          :disabled="saving || shifts.length === 1"
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
import { UserService } from '@/services/user/user-service'
import PokemonSlotDisplay from '@/components/custom-components/pokemon-slot-display.vue'
import { pokemonImage } from '@/services/utils/image-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import {
  CookingAssistSBulkUp,
  CookingPowerUpS,
  CookingPowerUpSMinus,
  TastyChanceS,
  subskill,
  type PokemonInstanceExt,
  type TeamScheduleShift,
  type TeamScheduleType
} from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

const dialogStore = useDialogStore()
const teamStore = useTeamStore()
const pokemonStore = usePokemonStore()
const userStore = useUserStore()
const selectedShift = ref<TeamScheduleShift | null>(null)
const timeShift = ref<TeamScheduleShift | null>(null)
const timePicker = ref(false)
const updatedTime = ref<string | null>(null)
const conditionTarget = ref('1')
const saving = ref(false)
const scheduleShifts = ref<TeamScheduleShift[]>([])
const pokemonFor = (externalId: string) => pokemonStore.getPokemon(externalId)
const selectedPokemon = computed(() => selectedShift.value && pokemonFor(selectedShift.value.externalId))

const slotIndex = computed(() => dialogStore.scheduleSlotIndex)
const shifts = computed(() => {
  if (scheduleType.value !== 'time') return scheduleShifts.value
  const minutes = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
  }
  const wakeup = minutes(teamStore.getCurrentTeam.wakeup)
  const sinceWakeup = (time: string) => (minutes(time) - wakeup + 1440) % 1440
  return scheduleShifts.value.slice().sort((a, b) => sinceWakeup(a.startTime) - sinceWakeup(b.startTime))
})
const scheduleType = ref<TeamScheduleType>('time')
const scheduleTiles = computed(() =>
  shifts.value.map((shift) => {
    const pokemon = pokemonFor(shift.externalId)
    const subskillBadge = [subskill.HELPING_BONUS, subskill.ENERGY_RECOVERY_BONUS]
      .filter((teamSubskill) =>
        pokemon?.subskills.some(
          (support) =>
            support.subskill.name.toLowerCase() === teamSubskill.name.toLowerCase() && support.level <= pokemon.level
        )
      )
      .map((teamSubskill) => teamSubskill.shortName)
      .join(' + ')
    return { shift, pokemon, subskillBadge }
  })
)
const limitedToTwo = computed(() => scheduleType.value === 'tasty-chance' || scheduleType.value === 'pot-size')
const targetError = computed(() => {
  if (!limitedToTwo.value) return ''
  const target = Number(conditionTarget.value)
  if (!Number.isFinite(target) || target < 1) return 'Enter a number of at least 1.'
  if (scheduleType.value === 'tasty-chance' && target > 70) return 'Enter a chance of 70% or less.'
  if (scheduleType.value === 'pot-size' && !Number.isSafeInteger(target)) return 'Enter a whole number for pot size.'
  return ''
})
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

watch(
  [() => dialogStore.scheduleDialog, () => slotIndex.value],
  ([open]) => {
    selectedShift.value = null
    timeShift.value = null
    timePicker.value = false
    if (!open || slotIndex.value === null) {
      scheduleShifts.value = []
      return
    }
    const next = teamStore.getSchedule(slotIndex.value).map((shift) => ({ ...shift }))
    scheduleShifts.value = next
    scheduleType.value = next[0]?.type === 'tasty-chance' || next[0]?.type === 'pot-size' ? next[0].type : 'time'
    conditionTarget.value = String(
      scheduleType.value === 'tasty-chance' ? (next[0]?.tastyChanceTarget ?? 30) : (next[0]?.potSizeTarget ?? 1)
    )
  },
  { immediate: true }
)

const image = (externalId: string) => {
  const pokemon = pokemonFor(externalId)
  return pokemon ? pokemonImage({ pokemonName: pokemon.pokemon.name, shiny: pokemon.shiny }) : ''
}
const allowedStep = (minute: number) => minute % 5 === 0

// Serialize saves so a slower earlier calculation cannot replace a later edit.
let saveQueue = Promise.resolve()
let pendingSaves = 0
const runSave = (action: () => Promise<void>) => {
  pendingSaves++
  saving.value = true
  const save = saveQueue.then(action, action)
  saveQueue = save.finally(() => {
    pendingSaves--
    saving.value = pendingSaves > 0
  })
  return saveQueue
}
const persistSchedule = (next: TeamScheduleShift[]) => {
  const index = slotIndex.value
  if (index === null || JSON.stringify(next) === JSON.stringify(scheduleShifts.value)) return Promise.resolve()
  scheduleShifts.value = next
  return runSave(async () => {
    await teamStore.setSchedule(index, next)
    teamStore.resetCurrentTeamIvs()
  })
}

const changeScheduleType = async (type: TeamScheduleType) => {
  if (saving.value) return
  if ((type === 'tasty-chance' && !canUseTastyChance.value) || (type === 'pot-size' && !canUsePotSize.value)) return
  const currentShifts = scheduleShifts.value
  scheduleType.value = type
  const next = (limitedToTwo.value ? currentShifts.slice(0, 2) : currentShifts).map((shift, index) => ({
    ...shift,
    type,
    tastyChanceTarget: type === 'tasty-chance' && index === 0 ? (shift.tastyChanceTarget ?? 30) : undefined,
    potSizeTarget: type === 'pot-size' && index === 0 ? (shift.potSizeTarget ?? 1) : undefined
  }))
  conditionTarget.value = String(
    scheduleType.value === 'tasty-chance' ? (next[0]?.tastyChanceTarget ?? 30) : (next[0]?.potSizeTarget ?? 1)
  )
  await persistSchedule(next)
}
const closeSchedule = async () => {
  // Closing never saves a separate draft, but lets already requested saves finish.
  while (saving.value) await saveQueue
  dialogStore.closeSchedule()
}
const saveTarget = async () => {
  if (targetError.value || !limitedToTwo.value || slotIndex.value === null) return
  const target = Number(conditionTarget.value)
  await persistSchedule(
    scheduleShifts.value.map((shift, index) => ({
      ...shift,
      tastyChanceTarget: scheduleType.value === 'tasty-chance' && index === 0 ? target : undefined,
      potSizeTarget: scheduleType.value === 'pot-size' && index === 0 ? target : undefined
    }))
  )
}
const addPokemon = () => {
  if (saving.value || (limitedToTwo.value && shifts.value.length >= 2)) return
  dialogStore.openPokemonSearch(async (pokemon) => {
    if (slotIndex.value === null || saving.value) return
    pokemonStore.upsertLocalPokemon(pokemon)
    const latest = shifts.value.at(-1)?.startTime ?? teamStore.getCurrentTeam.wakeup
    const [hour, minute] = latest.split(':').map(Number)
    const nextMinutes = (hour * 60 + minute + 5) % 1440
    const added: TeamScheduleShift = {
      slotIndex: slotIndex.value,
      externalId: pokemon.externalId,
      startTime: `${String(Math.floor(nextMinutes / 60)).padStart(2, '0')}:${String(nextMinutes % 60).padStart(2, '0')}`,
      type: scheduleType.value
    }
    await persistSchedule([...scheduleShifts.value, added])
  })
}
const removeShift = async () => {
  if (saving.value || !selectedShift.value || shifts.value.length === 1) return
  const index = scheduleShifts.value.indexOf(selectedShift.value)
  selectedShift.value = null
  const remaining = scheduleShifts.value.filter((_, shiftIndex) => shiftIndex !== index)
  if (limitedToTwo.value && index === 0) {
    remaining[0] = {
      ...remaining[0],
      tastyChanceTarget: scheduleShifts.value[0].tastyChanceTarget,
      potSizeTarget: scheduleShifts.value[0].potSizeTarget
    }
  }
  await persistSchedule(remaining)
}
const saveTime = async () => {
  if (saving.value) return
  if (!timeShift.value || !updatedTime.value) return
  if (shifts.value.some((shift) => shift !== timeShift.value && shift.startTime === updatedTime.value)) return
  const shiftToUpdate = timeShift.value
  const nextShifts = scheduleShifts.value.map((shift) =>
    shift === shiftToUpdate ? { ...shift, startTime: updatedTime.value! } : shift
  )
  timeShift.value = null
  timePicker.value = false
  await persistSchedule(nextShifts)
}
const openTimePicker = (shift: TeamScheduleShift) => {
  timeShift.value = shift
  updatedTime.value = shift.startTime
  timePicker.value = true
}
const savePokemon = (updated: PokemonInstanceExt) =>
  runSave(async () => {
    pokemonStore.upsertLocalPokemon(updated)
    const inSchedule = teamStore.getCurrentTeam.schedule?.some((shift) => shift.externalId === updated.externalId)
    const primaryIndex = teamStore.getCurrentTeam.members.indexOf(updated.externalId)
    if (inSchedule) {
      await teamStore.updateTeam()
      await teamStore.calculateProduction(teamStore.currentIndex)
      teamStore.resetCurrentTeamIvs()
    } else if (primaryIndex >= 0) {
      await teamStore.updateTeamMember(updated, primaryIndex)
    } else {
      if (userStore.loggedIn) await UserService.upsertPokemon(updated)
      await teamStore.calculateProduction(teamStore.currentIndex)
      teamStore.resetCurrentTeamIvs()
    }
  })
const editPokemon = () => {
  const shift = selectedShift.value
  const pokemon = shift && pokemonFor(shift.externalId)
  if (!pokemon || saving.value) return
  dialogStore.openPokemonInput(savePokemon, pokemon)
  selectedShift.value = null
}
const togglePokebox = async () => {
  const pokemon = selectedPokemon.value
  if (!userStore.loggedIn || !pokemon || saving.value) return
  await savePokemon({ ...pokemon, saved: !pokemon.saved })
}
</script>

<style scoped>
.schedule-row {
  overflow-x: auto;
  padding-bottom: 8px;
}
.schedule-row-timed {
  padding-bottom: 52px;
}
.schedule-time-button {
  position: absolute;
  top: 100%;
  left: 50%;
  /* Match the Pokémon card inside the dense column's 4px side padding. */
  width: calc(100% - 8px);
  min-width: 0;
  margin-top: 8px;
  transform: translateX(-50%);
}
.schedule-tile {
  position: relative;
  flex: 1 0 18%;
  min-width: 18%;
  max-width: 18%;
  max-height: 25dvh;
  aspect-ratio: 6 / 10;
}
.schedule-add-slot {
  flex-basis: 20%;
  min-width: 20%;
  max-width: 20%;
}
</style>
