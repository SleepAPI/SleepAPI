import { NatureError } from '@src/domain/error/stat/stat-error';
import { nature } from 'sleepapi-common';
import { getNature, getNatureNames } from './nature-utils';

describe('getNature', () => {
  it('shall return RASH for RaSh name', () => {
    expect(getNature('RaSh')).toBe(nature.RASH);
  });

  it("shall throw if Nature can't be found", () => {
    expect(() => getNature('missing')).toThrow(NatureError);
  });
});

describe('getNatureNames', () => {
  it('shall get all nature names', () => {
    expect(getNatureNames()).toMatchInlineSnapshot(`
      [
        "Lonely",
        "Adamant",
        "Naughty",
        "Brave",
        "Bold",
        "Impish",
        "Lax",
        "Relaxed",
        "Modest",
        "Mild",
        "Rash",
        "Quiet",
        "Calm",
        "Gentle",
        "Careful",
        "Sassy",
        "Timid",
        "Hasty",
        "Jolly",
        "Naive",
        "Bashful",
        "Hardy",
        "Docile",
        "Quirky",
        "Serious",
      ]
    `);
  });
});

describe('natures', () => {
  it.each(nature.NATURES.map((nat) => [nat.name, nat]))(
    'nature "%s" modifier shall match prettified name',
    (name, nat) => {
      function formatModifier(value: number, trait: string): string {
        if (value > 1) return `+${trait}`;
        if (value < 1) return `-${trait}`;
        return '';
      }

      const allModifiers = [
        { value: nat.exp, trait: 'exp' },
        { value: nat.ingredient, trait: 'ing' },
        { value: nat.skill, trait: 'skill' },
        { value: nat.energy, trait: 'energy' },
        { value: nat.frequency, trait: 'speed' },
      ];

      const positiveModifiers = allModifiers
        .map((mod) => formatModifier(mod.value, mod.trait))
        .filter((modStr) => modStr.startsWith('+'));

      const negativeModifiers = allModifiers
        .map((mod) => formatModifier(mod.value, mod.trait))
        .filter((modStr) => modStr.startsWith('-'));

      const combinedModifiers = [...positiveModifiers, ...negativeModifiers].join(' ');

      const expectedPrettyName = combinedModifiers.length
        ? `${nat.name} (${combinedModifiers})`
        : `${nat.name} (neutral)`;

      expect(nat.prettyName).toEqual(expectedPrettyName);
    }
  );
});
