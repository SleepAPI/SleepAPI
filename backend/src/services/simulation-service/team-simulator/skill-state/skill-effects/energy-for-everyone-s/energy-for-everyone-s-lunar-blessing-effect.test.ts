import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { EnergyForEveryoneSLunarBlessingEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-s/energy-for-everyone-s-lunar-blessing-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import * as commonModule from 'sleepapi-common';
import { CarrySizeUtils, EnergyForEveryoneSLunarBlessing, MAX_TEAM_SIZE } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EnergyForEveryoneSLunarBlessingEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let effect: EnergyForEveryoneSLunarBlessingEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    effect = new EnergyForEveryoneSLunarBlessingEffect();
  });

  it('should activate with correct berry amounts for 1 unique member', () => {
    const unique = 1;
    const skillLevel = 1;
    const energyForEveryoneAmount = EnergyForEveryoneSLunarBlessing.energyAmounts[skillLevel - 1];

    const preExistingSkillProduce = mocks.produce();
    const expectedSelfBerryAmount = EnergyForEveryoneSLunarBlessing.selfBerries[unique][skillLevel - 1];
    const expectedTeamBerryAmount = EnergyForEveryoneSLunarBlessing.teamBerries[unique][skillLevel - 1];

    const mockTeam = [mocks.teamMember()];
    Object.defineProperty(memberState, 'team', {
      get: () => mockTeam
    });
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    skillState.memberState.member.settings.skillLevel = skillLevel;

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: EnergyForEveryoneSLunarBlessing,
      activations: [
        {
          unit: 'berries',
          self: { regular: expectedSelfBerryAmount + expectedTeamBerryAmount, crit: 0 }
        },
        {
          unit: 'energy',
          team: { regular: energyForEveryoneAmount, crit: 0 }
        }
      ]
    });

    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [{ berry: memberState.berry, amount: expectedSelfBerryAmount, level: memberState.level }],
      ingredients: []
    });
  });

  it('should activate with correct berry amounts for maximum unique members', () => {
    const unique = MAX_TEAM_SIZE;
    const skillLevel = 3;
    const energyForEveryoneAmount = EnergyForEveryoneSLunarBlessing.energyAmounts[skillLevel - 1];

    const team = Array(5)
      .fill(null)
      .map((_, index) =>
        mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: `member ${index}` })
          })
        })
      );

    Object.defineProperty(memberState, 'team', {
      get: () => team
    });

    Object.defineProperty(memberState, 'otherMembers', {
      get: () => team.slice(1).map((member) => mocks.memberState({ member }))
    });

    vimic(commonModule, 'uniqueMembersWithBerry', () => unique);

    skillState.memberState.member.settings.skillLevel = skillLevel;

    const expectedSelfBerryAmount = EnergyForEveryoneSLunarBlessing.selfBerries[unique][skillLevel - 1];
    const expectedTeamBerryAmount = EnergyForEveryoneSLunarBlessing.teamBerries[unique][skillLevel - 1];

    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: EnergyForEveryoneSLunarBlessing,
      activations: [
        {
          unit: 'berries',
          self: { regular: expectedSelfBerryAmount + expectedTeamBerryAmount, crit: 0 }
        },
        {
          unit: 'energy',
          team: { regular: energyForEveryoneAmount, crit: 0 }
        }
      ]
    });

    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...team.slice(1).map((member) => ({
          berry: member.pokemonWithIngredients.pokemon.berry,
          amount: expectedTeamBerryAmount,
          level: member.settings.level
        })),
        { berry: memberState.berry, amount: expectedSelfBerryAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });

  it('should handle bogus members', () => {
    const skillLevel = 1;
    const energyForEveryoneAmount = EnergyForEveryoneSLunarBlessing.energyAmounts[skillLevel - 1];

    // When team size exceeds MAX_TEAM_SIZE, unique is forced to 1
    const expectedUnique = 1;
    const expectedSelfBerryAmount = EnergyForEveryoneSLunarBlessing.selfBerries[expectedUnique][skillLevel - 1];
    const expectedTeamBerryAmount = EnergyForEveryoneSLunarBlessing.teamBerries[expectedUnique][skillLevel - 1];

    const largeTeam = Array(MAX_TEAM_SIZE + 2)
      .fill(null)
      .map((_, index) =>
        mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: `member ${index}` })
          })
        })
      );
    Object.defineProperty(memberState, 'team', {
      get: () => largeTeam
    });

    Object.defineProperty(memberState, 'otherMembers', {
      get: () => largeTeam.slice(1).map((member) => mocks.memberState({ member }))
    });

    skillState.memberState.member.settings.skillLevel = skillLevel;

    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: EnergyForEveryoneSLunarBlessing,
      activations: [
        {
          unit: 'berries',
          self: { regular: expectedSelfBerryAmount + expectedTeamBerryAmount, crit: 0 }
        },
        {
          unit: 'energy',
          team: { regular: energyForEveryoneAmount, crit: 0 }
        }
      ]
    });

    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...largeTeam.slice(1).map((member) => ({
          berry: member.pokemonWithIngredients.pokemon.berry,
          amount: expectedTeamBerryAmount,
          level: member.settings.level
        })),
        { berry: memberState.berry, amount: expectedSelfBerryAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });
});
