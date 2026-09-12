import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { BerryBurstDracoMeteorEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst/berry-burst-draco-meteor-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { BerryBurstDracoMeteor, CarrySizeUtils, LATIAS, LATIOS } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('BerryBurstDracoMeteorEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let effect: BerryBurstDracoMeteorEffect;

  beforeEach(() => {
    memberState = mocks.memberState({
      member: mocks.teamMember({
        pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIOS })
      })
    });
    Object.defineProperty(memberState, 'team', {
      get: () => [memberState.member, ...memberState.otherMembers.map((member) => member.member)]
    });
    skillState = mocks.skillState(memberState);
    effect = new BerryBurstDracoMeteorEffect();
  });

  it('should activate skill and return correct self value without latias on team', () => {
    const regularSelfAmount = 12;
    const regularTeamAmount = 1;
    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'skillTeamAmount', () => regularTeamAmount);
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: BerryBurstDracoMeteor,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: regularSelfAmount + regularTeamAmount * memberState.otherMembers.length,
            crit: 0
          }
        }
      ]
    });
    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [{ berry: memberState.berry, amount: regularSelfAmount, level: memberState.level }],
      ingredients: []
    });
  });

  it('should use paired activation when latias is on team', () => {
    const soloSelfAmount = 12;
    const pairedSelfAmount = 14;
    const regularTeamAmount = 1;
    const preExistingSkillProduce = mocks.produce();
    memberState.otherMembers = [
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIAS })
        })
      })
    ];
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });
    vimic(skillState, 'skillAmount', (activation) => {
      if (activation === BerryBurstDracoMeteor.activations.paired) {
        return pairedSelfAmount;
      }
      return soloSelfAmount;
    });
    vimic(skillState, 'skillTeamAmount', () => regularTeamAmount);
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: BerryBurstDracoMeteor,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: pairedSelfAmount + regularTeamAmount * memberState.otherMembers.length,
            crit: 0
          }
        }
      ]
    });
    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...memberState.otherMembers.map((member) => ({
          berry: member.berry,
          amount: regularTeamAmount,
          level: member.level
        })),
        { berry: memberState.berry, amount: pairedSelfAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });

  it('should handle no other members correctly', () => {
    memberState.otherMembers = [];
    const regularSelfAmount = 12;
    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });
    vimic(skillState, 'skillAmount', () => regularSelfAmount);
    vimic(skillState, 'skillTeamAmount', () => 1);
    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: BerryBurstDracoMeteor,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: regularSelfAmount,
            crit: 0
          }
        }
      ]
    });
    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [{ berry: memberState.berry, amount: regularSelfAmount, level: memberState.level }],
      ingredients: []
    });
  });

  it('should use the solo matrix values for teams with three same-type species', () => {
    const skillLevel = 3;
    const expectedSelfAmount = 35;
    const expectedTeamAmount = 2;

    memberState.otherMembers = [
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'same-berry-1', berry: LATIOS.berry })
          })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'same-berry-2', berry: LATIOS.berry })
          })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'off-berry-1' })
          })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'off-berry-2' })
          })
        })
      })
    ];
    skillState.memberState.member.settings.skillLevel = skillLevel;
    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: BerryBurstDracoMeteor,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: expectedSelfAmount + expectedTeamAmount * memberState.otherMembers.length,
            crit: 0
          }
        }
      ]
    });
    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...memberState.otherMembers.map((member) => ({
          berry: member.berry,
          amount: expectedTeamAmount,
          level: member.level
        })),
        { berry: memberState.berry, amount: expectedSelfAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });

  it('should use the paired matrix values when latias makes the team count five same-type species', () => {
    const skillLevel = 6;
    const expectedSelfAmount = 68;
    const expectedTeamAmount = 5;

    memberState.otherMembers = [
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: LATIAS })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'same-berry-1', berry: LATIOS.berry })
          })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'same-berry-2', berry: LATIOS.berry })
          })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'same-berry-3', berry: LATIOS.berry })
          })
        })
      })
    ];
    skillState.memberState.member.settings.skillLevel = skillLevel;
    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: BerryBurstDracoMeteor,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: expectedSelfAmount + expectedTeamAmount * memberState.otherMembers.length,
            crit: 0
          }
        }
      ]
    });
    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...memberState.otherMembers.map((member) => ({
          berry: member.berry,
          amount: expectedTeamAmount,
          level: member.level
        })),
        { berry: memberState.berry, amount: expectedSelfAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });

  it('should count distinct same-type species rather than duplicate teammates of the same species', () => {
    const skillLevel = 2;
    const expectedSelfAmount = 24;
    const expectedTeamAmount = 1;

    const duplicateSpecies = mocks.mockPokemon({ name: 'same-berry-1', berry: LATIOS.berry });
    memberState.otherMembers = [
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: duplicateSpecies })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({ pokemon: duplicateSpecies })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'off-berry-1' })
          })
        })
      }),
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: mocks.mockPokemon({ name: 'off-berry-2' })
          })
        })
      })
    ];
    skillState.memberState.member.settings.skillLevel = skillLevel;
    const preExistingSkillProduce = mocks.produce();
    Object.defineProperty(memberState, 'skillProduce', {
      get: () => preExistingSkillProduce,
      set: vi.fn()
    });

    const addToInventoryMock = vimic(CarrySizeUtils, 'addToInventory');

    const result = effect.activate(skillState);

    expect(result).toEqual({
      skill: BerryBurstDracoMeteor,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: expectedSelfAmount + expectedTeamAmount * memberState.otherMembers.length,
            crit: 0
          }
        }
      ]
    });
    expect(addToInventoryMock).toHaveBeenCalledTimes(1);
    expect(addToInventoryMock).toHaveBeenCalledWith(preExistingSkillProduce, {
      berries: [
        ...memberState.otherMembers.map((member) => ({
          berry: member.berry,
          amount: expectedTeamAmount,
          level: member.level
        })),
        { berry: memberState.berry, amount: expectedSelfAmount, level: memberState.level }
      ],
      ingredients: []
    });
  });
});
