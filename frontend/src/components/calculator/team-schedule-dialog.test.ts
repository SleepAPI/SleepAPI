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

  async function actionButton(label = 'Close') {
    if (label === 'dismiss') {
      wrapper.findAllComponents({ name: 'VDialog' })[0].vm.$emit('update:modelValue', false)
      await flushPromises()
      return
    }
    const button = wrapper.findAllComponents({ name: 'VBtn' }).find((button) => button.text() === label)!
    await button.trigger('click')
    await flushPromises()
  }

  it.each([
    { saved: false, action: 'Close' },
    { saved: true, action: 'Close' },
    { saved: false, action: 'dismiss' },
    { saved: true, action: 'dismiss' }
  ])('handles $action after toggling Pokebox membership from saved=$saved', async ({ saved, action }) => {
    useUserStore().setInitialLoginData(commonMocks.loginResponse())
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
    await flushPromises()
    expect(pokemonStore.getPokemon(externalId)?.saved).toBe(!saved)
    expect(server.history.put).toHaveLength(1)

    await actionButton(action)

    expect(pokemonStore.getPokemon(externalId)?.saved).toBe(!saved)
    const pokeboxRequests = server.history.put.filter((request) => request.url === 'team/meta/0')
    expect(pokeboxRequests).toHaveLength(1)
    expect(JSON.parse(pokeboxRequests[0].data).scheduledMembers).toEqual([
      expect.objectContaining({ externalId, saved: !saved })
    ])
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
  ])('saves the $type target and recalculates without closing', async ({ type, value, field, inputmode }) => {
    await open(type)
    expect(targetInput().attributes('type')).toBe('text')
    expect(targetInput().attributes('inputmode')).toBe(inputmode)
    await targetInput().setValue(value)
    await flushPromises()
    expect(server.history.post).toHaveLength(0)
    await targetInput().trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(useDialogStore().scheduleDialog).toBe(true)
    expect(useTeamStore().getCurrentTeam.schedule![0]).toHaveProperty(field, Number(value))
    expect(server.history.post).toHaveLength(1)
    expect(JSON.parse(server.history.post[0].data).settings.schedule[0]).toHaveProperty(field, Number(value))
    await actionButton()
    useDialogStore().openSchedule(0)
    await flushPromises()
    expect(targetInput().element.value).toBe(value)
    expect(server.history.post).toHaveLength(1)
  })

  it.each(['Close', 'dismiss'])('retains the target after %s', async (action) => {
    await open('pot-size')
    await targetInput().setValue('200')
    await targetInput().trigger('keydown', { key: 'Enter' })
    await actionButton(action)
    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(200)
    expect(server.history.post).toHaveLength(1)
    useDialogStore().openSchedule(0)
    await flushPromises()
    expect(targetInput().element.value).toBe('200')
  })

  it.each(['Close', 'dismiss'])('saves the target on blur and retains it after %s', async (action) => {
    await open('pot-size')
    await targetInput().setValue('200')
    await flushPromises()
    expect(server.history.post).toHaveLength(0)
    await targetInput().trigger('blur')
    await flushPromises()
    expect(server.history.post).toHaveLength(1)
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(200)
    expect(useDialogStore().scheduleDialog).toBe(true)
    await actionButton(action)
    useDialogStore().openSchedule(0)
    await flushPromises()
    expect(targetInput().element.value).toBe('200')
    expect(server.history.post).toHaveLength(1)
  })

  it('does not save twice when Enter is followed by blur', async () => {
    await open('tasty-chance')
    await targetInput().setValue('35.5')
    await targetInput().trigger('keydown', { key: 'Enter' })
    await targetInput().trigger('blur')
    await flushPromises()
    expect(useTeamStore().getCurrentTeam.schedule![0].tastyChanceTarget).toBe(35.5)
    expect(server.history.post).toHaveLength(1)
    expect(useDialogStore().scheduleDialog).toBe(true)
  })

  it.each([
    { type: 'tasty-chance' as const, value: '' },
    { type: 'tasty-chance' as const, value: 'abc' },
    { type: 'tasty-chance' as const, value: '71' },
    { type: 'pot-size' as const, value: '0' },
    { type: 'pot-size' as const, value: '2.5' }
  ])('does not save an invalid $type target "$value"', async ({ type, value }) => {
    await open(type)
    await targetInput().setValue(value)
    await flushPromises()
    expect(server.history.post).toHaveLength(0)
    await targetInput().trigger('keydown', { key: 'Enter' })
    await targetInput().trigger('blur')
    await flushPromises()

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
    await targetInput().setValue('20')
    await targetInput().trigger('keydown', { key: 'Enter' })
    await actionButton()

    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(server.history.post).toHaveLength(0)
  })

  it.each(['Close', 'dismiss'])('finishes rapid target edits in order before %s', async (action) => {
    server.resetHandlers()
    let finishFirst!: () => void
    server.onPost('/calculator/team').replyOnce(
      () =>
        new Promise((resolve) => {
          finishFirst = () => resolve([200, { members: [] }])
        })
    )
    server.onPost('/calculator/team').reply(200, { members: [] })
    await open('pot-size')
    await targetInput().setValue('110')
    await targetInput().trigger('keydown', { key: 'Enter' })
    await flushPromises()
    await targetInput().setValue('120')
    await targetInput().trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(targetInput().element.value).toBe('120')
    expect(targetInput().attributes('disabled')).toBeUndefined()
    expect(useDialogStore().scheduleDialog).toBe(true)
    expect(server.history.post).toHaveLength(1)
    await actionButton(action)
    expect(useDialogStore().scheduleDialog).toBe(true)
    finishFirst()
    await flushPromises()
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(120)
    expect(server.history.post).toHaveLength(2)
    expect(JSON.parse(server.history.post[1].data).settings.schedule[0].potSizeTarget).toBe(120)
    expect(useDialogStore().scheduleDialog).toBe(false)
  })

  it('saves a schedule type change immediately', async () => {
    await open('pot-size')
    wrapper.findComponent({ name: 'VSelect' }).vm.$emit('update:modelValue', 'time')
    await flushPromises()
    expect(useTeamStore().getCurrentTeam.schedule![0].type).toBe('time')
    expect(server.history.post).toHaveLength(1)
    await actionButton()

    expect(useTeamStore().getCurrentTeam.schedule![0].type).toBe('time')
    expect(server.history.post).toHaveLength(1)
  })

  it('allows closing with an invalid target while retaining the last valid value', async () => {
    await open('pot-size')
    await targetInput().setValue('')
    await actionButton('Close')

    expect(useDialogStore().scheduleDialog).toBe(false)
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(100)
    expect(server.history.post).toHaveLength(0)
  })

  it.each(['Close', 'dismiss'])('keeps an edited rotation partner saved after schedule %s', async (action) => {
    useUserStore().setInitialLoginData(commonMocks.loginResponse())
    server.onPut('team/meta/0').reply(200, { version: 1 })
    await open('pot-size')
    const team = useTeamStore().getCurrentTeam
    const partner = mocks.createMockPokemon({ externalId: 'rotation-partner', level: 25 })
    usePokemonStore().upsertLocalPokemon(partner)
    team.schedule!.push({ slotIndex: 0, externalId: partner.externalId, startTime: '12:00', type: 'pot-size' })
    useDialogStore().closeSchedule()
    await nextTick()
    useDialogStore().openSchedule(0)
    await flushPromises()
    wrapper.findAllComponents(PokemonSlotDisplay)[1].vm.$emit('click')
    await flushPromises()
    await wrapper
      .findAllComponents({ name: 'VListItem' })
      .find((item) => item.props('title') === 'Edit')!
      .trigger('click')
    useDialogStore().savePokemonInput({ ...partner, level: 42 })
    await flushPromises()

    expect(useDialogStore().scheduleDialog).toBe(true)
    expect(usePokemonStore().getPokemon(partner.externalId)?.level).toBe(42)
    expect(server.history.post).toHaveLength(1)
    expect(JSON.parse(server.history.put[0].data).scheduledMembers).toEqual(
      expect.arrayContaining([expect.objectContaining({ externalId: partner.externalId, level: 42 })])
    )
    await actionButton(action)
    await flushPromises()
    expect(usePokemonStore().getPokemon(partner.externalId)?.level).toBe(42)
    expect(team.schedule).toHaveLength(2)
    expect(team.schedule![0].potSizeTarget).toBe(100)
    expect(JSON.parse(server.history.put[0].data).schedule[0].potSizeTarget).toBe(100)
    expect(server.history.post).toHaveLength(1)
  })

  it.each(['Close', 'dismiss'])('persists added Pokemon immediately before outer %s', async (action) => {
    useUserStore().setInitialLoginData(commonMocks.loginResponse())
    server.onPut('team/meta/0').reply(200, { version: 1 })
    await open('pot-size')
    const added = mocks.createMockPokemon({ externalId: 'rotation-partner' })
    const addCard = wrapper
      .findAllComponents({ name: 'VCard' })
      .find((card) => card.classes().includes('schedule-add-card'))!
    await addCard.trigger('click')
    useDialogStore().handlePokemonSelected(added)
    await flushPromises()
    expect(useTeamStore().getCurrentTeam.schedule).toHaveLength(2)
    expect(usePokemonStore().getPokemon(added.externalId)).toBeDefined()
    expect(server.history.post).toHaveLength(1)
    expect(JSON.parse(server.history.put[0].data).scheduledMembers).toEqual(
      expect.arrayContaining([expect.objectContaining({ externalId: added.externalId })])
    )
    expect(JSON.parse(server.history.put[0].data).schedule[0].potSizeTarget).toBe(100)
    await actionButton(action)
    expect(useTeamStore().getCurrentTeam.schedule).toHaveLength(2)
    expect(useTeamStore().getCurrentTeam.schedule![0].potSizeTarget).toBe(100)
    expect(server.history.post).toHaveLength(1)
    expect(usePokemonStore().getPokemon(added.externalId)).toBeDefined()
  })

  it('keeps the saved target when removing the first conditional member', async () => {
    await open('pot-size')
    await wrapper
      .findAllComponents({ name: 'VCard' })
      .find((card) => card.classes().includes('schedule-add-card'))!
      .trigger('click')
    const added = mocks.createMockPokemon({ externalId: 'rotation-partner' })
    useDialogStore().handlePokemonSelected(added)
    await flushPromises()
    await targetInput().setValue('200')
    await targetInput().trigger('keydown', { key: 'Enter' })
    await flushPromises()
    wrapper.findAllComponents(PokemonSlotDisplay)[0].vm.$emit('click')
    await flushPromises()
    await wrapper
      .findAllComponents({ name: 'VListItem' })
      .find((item) => item.props('title') === 'Remove from schedule')!
      .trigger('click')
    await flushPromises()
    await actionButton('Close')
    expect(useTeamStore().getCurrentTeam.schedule).toEqual([
      expect.objectContaining({ externalId: added.externalId, potSizeTarget: 200 })
    ])
  })

  it('starts a new member five minutes after the displayed saved shift time', async () => {
    await open('time')
    const timeButton = wrapper
      .findAllComponents({ name: 'VBtn' })
      .find((button) => button.classes().includes('schedule-time-button'))!
    await timeButton.trigger('click')
    await flushPromises()
    wrapper.findComponent({ name: 'VTimePicker' }).vm.$emit('update:modelValue', '12:30')
    await nextTick()
    await wrapper
      .findAllComponents({ name: 'VDialog' })[2]
      .findAllComponents({ name: 'VBtn' })
      .find((button) => button.text() === 'Save')!
      .trigger('click')
    await flushPromises()
    await wrapper
      .findAllComponents({ name: 'VCard' })
      .find((card) => card.classes().includes('schedule-add-card'))!
      .trigger('click')
    const added = mocks.createMockPokemon({ externalId: 'rotation-partner' })
    useDialogStore().handlePokemonSelected(added)
    await flushPromises()
    expect(useTeamStore().getCurrentTeam.schedule![0].startTime).toBe('12:30')
    expect(useTeamStore().getCurrentTeam.schedule).toHaveLength(2)
    expect(server.history.post).toHaveLength(2)
    expect(useTeamStore().getCurrentTeam.schedule![1].startTime).toBe('12:35')
    expect(useDialogStore().scheduleDialog).toBe(true)
    wrapper.findAllComponents(PokemonSlotDisplay)[1].vm.$emit('click')
    await flushPromises()
    await wrapper
      .findAllComponents({ name: 'VListItem' })
      .find((item) => item.props('title') === 'Remove from schedule')!
      .trigger('click')
    await flushPromises()
    expect(useTeamStore().getCurrentTeam.schedule).toHaveLength(1)
    expect(useTeamStore().getCurrentTeam.schedule![0].startTime).toBe('12:30')
    expect(server.history.post).toHaveLength(3)
    await actionButton('Close')
    expect(useTeamStore().getCurrentTeam.schedule![0].startTime).toBe('12:30')
    expect(useTeamStore().getCurrentTeam.schedule).toHaveLength(1)
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

  it.each(['Close', 'dismiss'])('saves time through its button and retains it after %s', async (action) => {
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
    expect(useTeamStore().getCurrentTeam.schedule![0].startTime).toBe('12:30')
    expect(server.history.post).toHaveLength(1)
    expect(useDialogStore().scheduleDialog).toBe(true)

    await actionButton(action)

    expect(useTeamStore().getCurrentTeam.schedule![0].startTime).toBe('12:30')
    expect(server.history.post).toHaveLength(1)
  })

  it('does not show time buttons for target-based rotations', async () => {
    await open('pot-size')
    expect(
      wrapper.findAllComponents({ name: 'VBtn' }).some((button) => button.classes().includes('schedule-time-button'))
    ).toBe(false)
  })
})
