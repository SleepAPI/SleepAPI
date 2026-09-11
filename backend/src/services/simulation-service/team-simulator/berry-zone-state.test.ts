import { describe, expect, it } from 'vitest';
import { berry, MEWTWO, Psystrike } from 'sleepapi-common';
import { BerryZoneState } from './berry-zone-state.js';
import { mocks } from '@src/vitest/index.js';
import { PsystrikeEffect } from './skill-state/skill-effects/berry-zone/psystrike-effect.js';

describe('Psychic berry zone', () => {
  it.each([
    { level: 1, bonus: 0.6, triggers: 40 },
    { level: 2, bonus: 0.8, triggers: 30 },
    { level: 3, bonus: 1, triggers: 24 },
    { level: 4, bonus: 1.2, triggers: 20 },
    { level: 5, bonus: 1.6, triggers: 15 },
    { level: 6, bonus: 2, triggers: 12 }
  ])('requires $triggers activations at level $level to reach 24%', ({ level, bonus, triggers }) => {
    const member = mocks.memberState();
    member.member.settings.skillLevel = level;
    const skillState = mocks.skillState(member);
    const effect = new PsystrikeEffect();
    effect.activate(skillState);
    expect(member.berryZoneState.bonusPercentage(berry.MAGO)).toBe(bonus);
    for (let trigger = 1; trigger < triggers - 1; trigger++) effect.activate(skillState);
    expect(member.berryZoneState.bonusPercentage(berry.MAGO)).toBeLessThan(24);
    effect.activate(skillState);
    expect(member.berryZoneState.bonusPercentage(berry.MAGO)).toBe(24);
  });
  it('stacks to 24%, affects only Mago berries, and resets on moving sites', () => {
    const zone = new BerryZoneState();
    zone.addBonus(berry.MAGO, 20, 24);
    zone.addBonus(berry.MAGO, 20, 24);
    expect(zone.bonusPercentage(berry.MAGO)).toBe(24);
    expect(zone.bonusFraction(berry.MAGO)).toBe(0.24);
    expect(zone.bonusFraction(berry.GREPA)).toBe(0);
    zone.reset();
    expect(zone.bonusPercentage(berry.MAGO)).toBe(0);
  });

  it('still grants Psystrike strength when the zone is already capped', () => {
    const member = mocks.memberState({
      member: mocks.teamMemberExt({
        pokemonWithIngredients: { pokemon: MEWTWO, ingredientList: [MEWTWO.ingredient0[0]] }
      })
    });
    const skillState = mocks.skillState(member);
    member.berryZoneState.addBonus(berry.MAGO, 24, 24);
    const activation = new PsystrikeEffect().activate(skillState);
    expect(activation.activations[0].self?.regular).toBe(
      Psystrike.activations.strength.amount({ skillLevel: skillState.skillLevel })
    );
    expect(member.berryZoneState.bonusPercentage(berry.MAGO)).toBe(24);
  });
});

describe('multiple berry zones', () => {
  it('preserves independent bonuses, caps, and berry levels when a second zone is added', () => {
    const zone = new BerryZoneState();
    zone.addBonus(berry.GREPA, 12, 24);
    zone.addBonus(berry.MAGO, 6, 10);
    zone.addBonus(berry.MAGO, 6, 10);
    zone.addBonus(berry.GREPA, 6, 24);
    const berries = [
      { berry: berry.GREPA, amount: 100, level: 30 },
      { berry: berry.MAGO, amount: 100, level: 60 },
      { berry: berry.ORAN, amount: 100, level: 50 }
    ];
    expect(zone.bonusBerries(berries)).toEqual([
      { berry: berry.GREPA, amount: 18, level: 30 },
      { berry: berry.MAGO, amount: 10, level: 60 }
    ]);
    expect(berries.every((set) => set.amount === 100)).toBe(true);
    zone.reset();
    expect(zone.bonusBerries(berries)).toEqual([]);
    zone.addBonus(berry.ORAN, 5, 24);
    expect(zone.bonusBerries(berries)).toEqual([{ berry: berry.ORAN, amount: 5, level: 50 }]);
  });
});
