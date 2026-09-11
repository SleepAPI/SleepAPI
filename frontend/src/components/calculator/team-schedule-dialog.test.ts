import PokemonSlotDisplay from '@/components/custom-components/pokemon-slot-display.vue'
import TeamScheduleDialog from '@/components/calculator/team-schedule-dialog.vue'
import serverAxios from '@/router/server-axios'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import MockAdapter from 'axios-mock-adapter'
import { commonMocks, subskill, type TeamScheduleType } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('TeamScheduleDialog', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamScheduleDialog>>
  let server: MockAdapter

  beforeEach(() => {
    server = new MockAdapter(serverAxios)
    server.onPost('/calculator/team').reply(200, { members: [] })
    const pokemon = mocks.createMockPokemon()
    usePokemonStore().upsertLocalPokemon(pokemon)
    useTeamStore().teams = createMockTeams(1, { members: [pokemon.externalId] })
    wrapper = mount(TeamScheduleDialog, { attachTo: document.body })
  })

  afterEach(() => {
    wrapper.unmount()
    server.restore()
  })

  async function open(type: TeamScheduleType) {
    const team = useTeamStore().getCurrentTeam
    team.schedule = [
      {
        slotIndex: 0,
        externalId: team.members[0]!,
        startTime: team.wakeup,
        type,
        ...(type === 'tasty-chance' ? { tastyChanceTarget: 20 } : { potSizeTarget: 100 })
      }
    ]
    useDialogStore().openSchedule(0)
    await flushPromises()
  }

  function targetInput() {
    return wrapper
      .findAllComponents({ name: 'VTextField' })
      .find((field) => field.props('id') === 'rotationTarget')!
      .get('input')
  }

  async function actionButton(label = 'Save') {
    const button = wrapper.findAllComponents({ name: 'VBtn' }).find((button) => button.text() === label)!
    await button.trigger('click')
    await flushPromises()
  }

  it.each([
    { saved: false, action: 'Save' },
    { saved: true, action: 'Save' },
    { saved: false, action: 'Cancel' },
    { saved: true, action: 'Cancel' }
  ])('handles $action after toggling Pokebox membership from saved=$saved', async ({ saved, action }) => {
    useUserStore().setInitialLoginData(commonMocks.loginResponse())
    server.onPut('user/pokemon').reply(200)
    server.onPut('team/meta/0').reply(200, { version: 1 })
    const pokemonStore = usePokemonStore()
    const externalId = useTeamStore().getCurrentTeam.members[0]!
    pokemonStore.upsertLocalPokemon({ ...pokemonStore.getPokemon(externalId)!, saved })
    await open('time')
    wrapper.findComponent(PokemonSlotDisplay).vm.$emit('click')
    await flushPromises()
    const pokeboxButton = () =>
      wrapper
        .findAllComponents({ name: 'VListItem' })
        .find((item) => item.attributes('id') === 'schedule-pokebox-button')!
    expect(pokeboxButton().text()).toBe(saved ? 'Remove from Pokebox' : 'Save to Pokebox')
    await pokeboxButton().trigger('click')
    expect(pokeboxButton().text()).toBe(saved ? 'Save to Pokebox' : 'Remove from Pokebox')
    expect(pokemonStore.getPokemon(externalId)?.saved).toBe(saved)
    expect(server.history.put).toHaveLength(0)

    await actionButton(action)

    expect(pokemonStore.getPokemon(externalId)?.saved).toBe(action === 'Save' ? !saved : saved)
    const pokeboxRequests = server.history.put.filter((request) => request.url === 'user/pokemon')
    expect(pokeboxRequests).toHaveLength(action === 'Save' ? 1 : 0)
    if (action === 'Save') {
      expect(JSON.parse(pokeboxRequests[0].data)).toMatchObject({ externalId, saved: !saved })
    }
  })

  it('disables Pokebox actions for logged-out users', async () => {
    await open('time')
    wrapper.findComponent(PokemonSlotDisplay).vm.$emit('click')
    await flushPromises()
    const button = wrapper
      .findAllComponents({ name: 'VListItem' })
      .find((item) => item.attributes('id') === 'schedule-pokebox-button')!
    expect(button.props('disabled')).toBe(true)
  })

  it.each([
    { type: 'tasty-chance' as const, value: '35.5', field: 'tastyChanceTarget', inputmode: 'decimal' },
    { type: 'pot-size' as const, value: '180', field: 'potSizeTarget', inputmode: 'numeric' }
  ])('saves the $type target and recalculates when saved', async ({ type, value, field, inputmode }) => {
    await open(type)
    expect(targetInput().attributes('type')).toBe('text')
    expect(targetInput().attributes('inputmode')).toBe(inputmode)
    await targetInput().setValue(value)
    expect(server.history.post).toHaveLength(0)

    await actionButton()

    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(useTeamStore().getCurrentTeam.schedule![0]).toHaveProperty(field, Number(value))
    expect(server.history.post).toHaveLength(1)
    expect(JSON.parse(server.history.post[0].data).settings.schedule[0]).toHaveProperty(field, Number(value))
    useDialogStore().openSchedule(0)
    await flushPromises()
    expect(targetInput().element.value).toBe(value)
  })

  it('discards the target when the dialog is dismissed', async () => {
    await open('pot-size')
    await targetInput().setValue('200')
    wrapper.findAllComponents({ name: 'VDialog' })[0].vm.$emit('update:modelValue', false)
    await flushPromises()

    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(100)
    expect(server.history.post).toHaveLength(0)
    useDialogStore().openSchedule(0)
    await flushPromises()
    expect(targetInput().element.value).toBe('100')
  })

  it.each([
    { type: 'tasty-chance' as const, value: '' },
    { type: 'tasty-chance' as const, value: 'abc' },
    { type: 'tasty-chance' as const, value: '71' },
    { type: 'pot-size' as const, value: '0' },
    { type: 'pot-size' as const, value: '2.5' }
  ])('keeps the dialog open for invalid $type target "$value"', async ({ type, value }) => {
    await open(type)
    await targetInput().setValue(value)
    await actionButton()

    expect(useDialogStore().scheduleDialog).toBe(true)
    expect(server.history.post).toHaveLength(0)
    expect(
      wrapper
        .findAllComponents({ name: 'VTextField' })
        .find((field) => field.props('id') === 'rotationTarget')!
        .props('errorMessages')
    ).not.toBe('')
  })

  it('does not recalculate when the target is unchanged', async () => {
    await open('tasty-chance')
    await actionButton()

    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(server.history.post).toHaveLength(0)
  })

  it('discards target and schedule type changes on Cancel', async () => {
    await open('pot-size')
    await targetInput().setValue('200')
    wrapper.findComponent({ name: 'VSelect' }).vm.$emit('update:modelValue', 'time')
    await nextTick()
    await actionButton('Cancel')

    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(useTeamStore().getCurrentTeam.schedule![0].type).toBe('pot-size')
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(100)
    expect(server.history.post).toHaveLength(0)
  })

  it('saves a schedule type change only on Save', async () => {
    await open('pot-size')
    wrapper.findComponent({ name: 'VSelect' }).vm.$emit('update:modelValue', 'time')
    await nextTick()
    expect(useTeamStore().getCurrentTeam.schedule![0].type).toBe('pot-size')
    expect(server.history.post).toHaveLength(0)
    await actionButton()

    expect(useTeamStore().getCurrentTeam.schedule![0].type).toBe('time')
    expect(server.history.post).toHaveLength(1)
  })

  it('allows cancelling an invalid target', async () => {
    await open('pot-size')
    await targetInput().setValue('')
    await actionButton('Cancel')

    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(100)
    expect(server.history.post).toHaveLength(0)
  })

  it.each(['Cancel', 'Save'])('keeps added Pokemon local until %s', async (action) => {
    await open('pot-size')
    const added = mocks.createMockPokemon({ externalId: 'rotation-partner' })
    const addCard = wrapper
      .findAllComponents({ name: 'VCard' })
      .find((card) => card.classes().includes('schedule-add-card'))!
    await addCard.trigger('click')
    useDialogStore().handlePokemonSelected(added)
    await nextTick()
    expect(useTeamStore().getCurrentTeam.schedule).toHaveLength(1)
    expect(usePokemonStore().getPokemon(added.externalId)).toBeUndefined()
    expect(server.history.post).toHaveLength(0)

    await actionButton(action)

    expect(useTeamStore().getCurrentTeam.schedule).toHaveLength(action === 'Save' ? 2 : 1)
    expect(server.history.post).toHaveLength(action === 'Save' ? 1 : 0)
    if (action === 'Save') {
      expect(usePokemonStore().getPokemon(added.externalId)).toBeDefined()
    } else {
      expect(usePokemonStore().getPokemon(added.externalId)).toBeUndefined()
    }
  })

  it('displays each scheduled Pokemon level, name, and team subskills', async () => {
    const pokemonStore = usePokemonStore()
    const team = useTeamStore().getCurrentTeam
    const primary = mocks.createMockPokemon({
      externalId: team.members[0]!,
      name: 'First helper',
      level: 30,
      subskills: [
        { level: 10, subskill: subskill.HELPING_BONUS },
        { level: 25, subskill: subskill.BERRY_FINDING_S },
        { level: 50, subskill: subskill.ENERGY_RECOVERY_BONUS }
      ]
    })
    const partner = mocks.createMockPokemon({
      externalId: 'rotation-partner',
      name: 'Night helper',
      level: 60,
      subskills: [
        { level: 10, subskill: subskill.HELPING_BONUS },
        { level: 50, subskill: subskill.ENERGY_RECOVERY_BONUS }
      ]
    })
    pokemonStore.upsertLocalPokemon(primary)
    pokemonStore.upsertLocalPokemon(partner)
    team.schedule = [
      { slotIndex: 0, externalId: primary.externalId, startTime: '06:00' },
      { slotIndex: 0, externalId: partner.externalId, startTime: '18:00' }
    ]
    useDialogStore().openSchedule(0)
    await flushPromises()

    const tiles = wrapper.findAllComponents(PokemonSlotDisplay)
    expect(tiles).toHaveLength(2)
    expect(tiles[0].text()).toContain('Level 30')
    expect(tiles[0].text()).toContain('First helper')
    expect(tiles[0].text()).not.toContain('06:00')
    expect(tiles[0].props('badge')).toBe('HB')
    expect(tiles[1].text()).toContain('Level 60')
    expect(tiles[1].text()).toContain('Night helper')
    expect(tiles[1].text()).not.toContain('18:00')
    const timeButtons = wrapper
      .findAllComponents({ name: 'VBtn' })
      .filter((button) => button.classes().includes('schedule-time-button'))
    expect(timeButtons.map((button) => button.text())).toEqual(['06:00', '18:00'])
    expect(tiles[1].props('badge')).toBe('HB + ERB')

    await tiles[1].get('.v-card').trigger('click')
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'VListItem' }).some((item) => item.props('title') === 'Edit')).toBe(true)
  })

  it.each(['Save', 'Cancel'])('edits time through its button and respects the outer %s action', async (action) => {
    await open('time')
    const originalTime = useTeamStore().getCurrentTeam.schedule![0].startTime
    const timeButton = wrapper
      .findAllComponents({ name: 'VBtn' })
      .find((button) => button.classes().includes('schedule-time-button'))!
    await timeButton.trigger('click')
    await flushPromises()
    const dialogs = wrapper.findAllComponents({ name: 'VDialog' })
    expect(dialogs[1].props('modelValue')).toBe(false)
    expect(dialogs[2].props('modelValue')).toBe(true)
    const picker = wrapper.findComponent({ name: 'VTimePicker' })
    expect(picker.props('modelValue')).toBe(originalTime)
    picker.vm.$emit('update:modelValue', '12:30')
    await nextTick()
    await dialogs[2]
      .findAllComponents({ name: 'VBtn' })
      .find((button) => button.text() === 'Save')!
      .trigger('click')
    await flushPromises()
    expect(dialogs[2].props('modelValue')).toBe(false)
    expect(
      wrapper
        .findAllComponents({ name: 'VBtn' })
        .find((button) => button.classes().includes('schedule-time-button'))!
        .text()
    ).toBe('12:30')
    expect(useTeamStore().getCurrentTeam.schedule![0].startTime).toBe(originalTime)
    expect(server.history.post).toHaveLength(0)

    await actionButton(action)

    expect(useTeamStore().getCurrentTeam.schedule![0].startTime).toBe(action === 'Save' ? '12:30' : originalTime)
    expect(server.history.post).toHaveLength(action === 'Save' ? 1 : 0)
  })

  it('does not show time buttons for target-based rotations', async () => {
    await open('pot-size')
    expect(
      wrapper.findAllComponents({ name: 'VBtn' }).some((button) => button.classes().includes('schedule-time-button'))
    ).toBe(false)
  })
})
