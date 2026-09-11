<template>
  <v-dialog
    :model-value="dialogStore.scheduleDialog"
    :persistent="saving"
    max-width="900px"
    scrollable
    @update:model-value="!$event && cancelSchedule()"
  >
    <v-card v-if="slotIndex !== null" title="Schedule">
      <v-card-text :inert="saving">
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
        <v-row class="schedule-row flex-nowrap" :class="{ 'schedule-row-timed': scheduleType === 'time' }" dense>
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
            :disabled="saving"
            type="text"
          />
        </template>
      </v-card-text>
      <v-row dense class="ma-2 mt-2">
        <v-col cols="6">
          <v-btn
            class="w-100 text-body"
            size="large"
            rounded="lg"
            color="surface"
            :disabled="saving"
            @click="cancelSchedule"
            >Cancel</v-btn
          >
        </v-col>
        <v-col cols="6">
          <v-btn
            class="w-100 text-body"
            size="large"
            rounded="lg"
            color="primary"
            :disabled="!!targetError"
            :loading="saving"
            @click="saveSchedule"
            >Save</v-btn
          >
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>

  <v-dialog v-model="shiftMenu" max-width="360px">
    <v-card v-if="selectedShift" title="Scheduled Pokémon">
      <v-list>
        <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="editPokemon" />
        <v-list-item
          id="schedule-pokebox-button"
          :disabled="!userStore.loggedIn"
          :prepend-icon="selectedPokemon?.saved ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"
          @click="togglePokebox"
          >{{ selectedPokemon?.saved ? 'Remove from Pokebox' : 'Save to Pokebox' }}</v-list-item
        >
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
import PokemonSlotDisplay from '@/components/custom-components/pokemon-slot-display.vue'
import { UserService } from '@/services/user/user-service'
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
const draftShifts = ref<TeamScheduleShift[]>([])
const draftPokemon = ref<Record<string, PokemonInstanceExt>>({})
const initialSchedule = ref('[]')
const pokemonFor = (externalId: string) => draftPokemon.value[externalId] ?? pokemonStore.getPokemon(externalId)
const selectedPokemon = computed(() => selectedShift.value && pokemonFor(selectedShift.value.externalId))

const slotIndex = computed(() => dialogStore.scheduleSlotIndex)
const shifts = computed(() => {
  if (scheduleType.value !== 'time') return draftShifts.value
  const minutes = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
  }
  const wakeup = minutes(teamStore.getCurrentTeam.wakeup)
  const sinceWakeup = (time: string) => (minutes(time) - wakeup + 1440) % 1440
  return draftShifts.value.slice().sort((a, b) => sinceWakeup(a.startTime) - sinceWakeup(b.startTime))
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
    draftPokemon.value = {}
    if (!open || slotIndex.value === null) {
      draftShifts.value = []
      return
    }
    const next = teamStore.getSchedule(slotIndex.value).map((shift) => ({ ...shift }))
    draftShifts.value = next
    initialSchedule.value = JSON.stringify(next)
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

const changeScheduleType = (type: TeamScheduleType) => {
  if ((type === 'tasty-chance' && !canUseTastyChance.value) || (type === 'pot-size' && !canUsePotSize.value)) return
  const currentShifts = shifts.value
  scheduleType.value = type
  const next = (limitedToTwo.value ? currentShifts.slice(0, 2) : currentShifts).map((shift, index) => ({
    ...shift,
    type,
    tastyChanceTarget: type === 'tasty-chance' && index === 0 ? (shift.tastyChanceTarget ?? 30) : undefined,
    potSizeTarget: type === 'pot-size' && index === 0 ? (shift.potSizeTarget ?? 1) : undefined
  }))
  draftShifts.value = next
  conditionTarget.value = String(
    scheduleType.value === 'tasty-chance' ? (next[0]?.tastyChanceTarget ?? 30) : (next[0]?.potSizeTarget ?? 1)
  )
}
const cancelSchedule = () => {
  if (!saving.value) dialogStore.closeSchedule()
}
const saveSchedule = async () => {
  if (saving.value || targetError.value || slotIndex.value === null) return
  const target = Number(conditionTarget.value)
  const next = limitedToTwo.value
    ? shifts.value.map((shift, index) => ({
        ...shift,
        type: scheduleType.value,
        tastyChanceTarget: scheduleType.value === 'tasty-chance' && index === 0 ? target : undefined,
        potSizeTarget: scheduleType.value === 'pot-size' && index === 0 ? target : undefined
      }))
    : shifts.value
  saving.value = true
  try {
    if (JSON.stringify(next) !== initialSchedule.value || Object.keys(draftPokemon.value).length > 0) {
      for (const pokemon of Object.values(draftPokemon.value)) {
        const wasSaved = pokemonStore.getPokemon(pokemon.externalId)?.saved ?? false
        if (userStore.loggedIn && pokemon.saved !== wasSaved) {
          await UserService.upsertPokemon(pokemon)
        }
        pokemonStore.upsertLocalPokemon(pokemon)
      }
      await teamStore.setSchedule(slotIndex.value, next)
    }
    dialogStore.closeSchedule()
  } finally {
    saving.value = false
  }
}
const addPokemon = () => {
  if (limitedToTwo.value && shifts.value.length >= 2) return
  dialogStore.openPokemonSearch((pokemon) => {
    if (slotIndex.value === null) return
    draftPokemon.value[pokemon.externalId] = pokemon
    const latest = shifts.value.at(-1)?.startTime ?? teamStore.getCurrentTeam.wakeup
    const [hour, minute] = latest.split(':').map(Number)
    const nextMinutes = (hour * 60 + minute + 5) % 1440
    draftShifts.value = [
      ...shifts.value,
      {
        slotIndex: slotIndex.value!,
        externalId: pokemon.externalId,
        startTime: `${String(Math.floor(nextMinutes / 60)).padStart(2, '0')}:${String(nextMinutes % 60).padStart(2, '0')}`,
        type: scheduleType.value
      }
    ]
  })
}
const removeShift = () => {
  if (!selectedShift.value || shifts.value.length === 1) return
  const shiftToRemove = selectedShift.value
  const nextShifts = shifts.value.filter((shift) => shift !== shiftToRemove)
  selectedShift.value = null
  draftShifts.value = nextShifts
}
const saveTime = () => {
  if (!timeShift.value || !updatedTime.value) return
  if (shifts.value.some((shift) => shift !== timeShift.value && shift.startTime === updatedTime.value)) return
  const shiftToUpdate = timeShift.value
  const nextShifts = shifts.value.map((shift) =>
    shift === shiftToUpdate ? { ...shift, startTime: updatedTime.value! } : shift
  )
  timeShift.value = null
  timePicker.value = false
  draftShifts.value = nextShifts
}
const openTimePicker = (shift: TeamScheduleShift) => {
  timeShift.value = shift
  updatedTime.value = shift.startTime
  timePicker.value = true
}
const editPokemon = () => {
  const shift = selectedShift.value
  const pokemon = shift && pokemonFor(shift.externalId)
  if (!pokemon) return
  dialogStore.openPokemonInput((updated) => {
    draftPokemon.value[updated.externalId] = updated
  }, pokemon)
  selectedShift.value = null
}
const togglePokebox = () => {
  const pokemon = selectedPokemon.value
  if (!userStore.loggedIn || !pokemon) return
  draftPokemon.value[pokemon.externalId] = { ...pokemon, saved: !pokemon.saved }
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
