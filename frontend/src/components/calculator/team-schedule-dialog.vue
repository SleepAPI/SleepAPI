<template>
  <v-dialog v-model="dialogStore.scheduleDialog" max-width="900px" scrollable>
    <v-card v-if="slotIndex !== null" title="Schedule">
      <v-card-text>
        <v-row class="schedule-row flex-nowrap" dense>
          <v-col v-for="shift in shifts" :key="`${shift.externalId}-${shift.startTime}`" class="schedule-tile" cols="auto">
            <v-card class="fill-height frosted-glass" @click="selectedShift = shift">
              <v-img v-if="pokemonFor(shift.externalId)" :src="image(shift.externalId)" height="104" width="104" />
              <v-card-text class="text-center pa-1">{{ shift.startTime }}</v-card-text>
            </v-card>
          </v-col>
          <v-col class="schedule-tile" cols="auto">
            <v-card class="fill-height frosted-glass d-flex align-center" height="136" width="112" @click="addPokemon">
              <v-icon class="w-100" color="secondary" size="44">mdi-plus</v-icon>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions><v-btn @click="dialogStore.closeSchedule">Close</v-btn></v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="shiftMenu" max-width="360px">
    <v-card v-if="selectedShift" title="Scheduled Pokémon">
      <v-list>
        <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="editPokemon" />
        <v-list-item prepend-icon="mdi-clock-outline" title="Change start time" @click="timePicker = true" />
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
      <v-card-actions><v-spacer /><v-btn @click="timePicker = false">Cancel</v-btn><v-btn color="primary" @click="saveTime">Save</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { avatarImage } from '@/services/utils/image-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamScheduleShift } from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

const dialogStore = useDialogStore()
const teamStore = useTeamStore()
const pokemonStore = usePokemonStore()
const selectedShift = ref<TeamScheduleShift | null>(null)
const timePicker = ref(false)
const updatedTime = ref<string | null>(null)

const slotIndex = computed(() => dialogStore.scheduleSlotIndex)
const shifts = computed(() => (slotIndex.value === null ? [] : teamStore.getSchedule(slotIndex.value)))
const shiftMenu = computed({ get: () => selectedShift.value !== null, set: (open) => !open && (selectedShift.value = null) })

watch(selectedShift, (shift) => { updatedTime.value = shift?.startTime ?? null })

const pokemonFor = (externalId: string) => pokemonStore.getPokemon(externalId)
const image = (externalId: string) => {
  const pokemon = pokemonFor(externalId)
  return pokemon ? avatarImage({ pokemonName: pokemon.pokemon.name, shiny: pokemon.shiny, happy: false }) : ''
}
const allowedStep = (minute: number) => minute % 5 === 0

const persist = async (targetSlotIndex: number, next: TeamScheduleShift[]) => {
  await teamStore.setSchedule(targetSlotIndex, next)
}
const addPokemon = () => {
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
        startTime: `${String(Math.floor(nextMinutes / 60)).padStart(2, '0')}:${String(nextMinutes % 60).padStart(2, '0')}`
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
.schedule-row { overflow-x: auto; padding-bottom: 8px; }
.schedule-tile { min-width: 112px; }
</style>
