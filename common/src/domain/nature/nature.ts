export type NatureModifier = 'speed' | 'ingredient' | 'skill' | 'energy' | 'exp' | 'neutral';

export interface Nature {
  name: string;
  prettyName: string; // TODO: remove this sleepapi 2.0
  positiveModifier: NatureModifier;
  negativeModifier: NatureModifier;
  frequency: number;
  ingredient: number;
  skill: number;
  energy: number;
  exp: number;
}

// --- HELP SPEED + --- //
export const LONELY: Nature = {
  name: 'Lonely',
  prettyName: 'Lonely (+speed -energy)',
  positiveModifier: 'speed',
  negativeModifier: 'energy',
  frequency: 1.1,
  ingredient: 1,
  skill: 1,
  energy: 0.88,
  exp: 1
};

export const ADAMANT: Nature = {
  name: 'Adamant',
  prettyName: 'Adamant (+speed -ing)',
  positiveModifier: 'speed',
  negativeModifier: 'ingredient',
  frequency: 1.1,
  ingredient: 0.8,
  skill: 1,
  energy: 1,
  exp: 1
};

export const NAUGHTY: Nature = {
  name: 'Naughty',
  prettyName: 'Naughty (+speed -skill)',
  positiveModifier: 'speed',
  negativeModifier: 'skill',
  frequency: 1.1,
  ingredient: 1,
  skill: 0.8,
  energy: 1,
  exp: 1
};

export const BRAVE: Nature = {
  name: 'Brave',
  prettyName: 'Brave (+speed -exp)',
  positiveModifier: 'speed',
  negativeModifier: 'exp',
  frequency: 1.1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 0.82
};

// --- ENERGY + --- //
export const BOLD: Nature = {
  name: 'Bold',
  prettyName: 'Bold (+energy -speed)',
  positiveModifier: 'energy',
  negativeModifier: 'speed',
  frequency: 0.9,
  ingredient: 1,
  skill: 1,
  energy: 1.2,
  exp: 1
};

export const IMPISH: Nature = {
  name: 'Impish',
  prettyName: 'Impish (+energy -ing)',
  positiveModifier: 'energy',
  negativeModifier: 'ingredient',
  frequency: 1,
  ingredient: 0.8,
  skill: 1,
  energy: 1.2,
  exp: 1
};

export const LAX: Nature = {
  name: 'Lax',
  prettyName: 'Lax (+energy -skill)',
  positiveModifier: 'energy',
  negativeModifier: 'skill',
  frequency: 1,
  ingredient: 1,
  skill: 0.8,
  energy: 1.2,
  exp: 1
};

export const RELAXED: Nature = {
  name: 'Relaxed',
  prettyName: 'Relaxed (+energy -exp)',
  positiveModifier: 'energy',
  negativeModifier: 'exp',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1.2,
  exp: 0.82
};

// --- ING + --- //
export const MODEST: Nature = {
  name: 'Modest',
  prettyName: 'Modest (+ing -speed)',
  positiveModifier: 'ingredient',
  negativeModifier: 'speed',
  frequency: 0.9,
  ingredient: 1.2,
  skill: 1,
  energy: 1,
  exp: 1
};
export const MILD: Nature = {
  name: 'Mild',
  prettyName: 'Mild (+ing -energy)',
  positiveModifier: 'ingredient',
  negativeModifier: 'energy',
  frequency: 1,
  ingredient: 1.2,
  skill: 1,
  energy: 0.88,
  exp: 1
};

export const RASH: Nature = {
  name: 'Rash',
  prettyName: 'Rash (+ing -skill)',
  positiveModifier: 'ingredient',
  negativeModifier: 'skill',
  frequency: 1,
  ingredient: 1.2,
  skill: 0.8,
  energy: 1,
  exp: 1
};
export const QUIET: Nature = {
  name: 'Quiet',
  prettyName: 'Quiet (+ing -exp)',
  positiveModifier: 'ingredient',
  negativeModifier: 'exp',
  frequency: 1,
  ingredient: 1.2,
  skill: 1,
  energy: 1,
  exp: 0.82
};

// --- SKILL + --- //
export const CALM: Nature = {
  name: 'Calm',
  prettyName: 'Calm (+skill -speed)',
  positiveModifier: 'skill',
  negativeModifier: 'speed',
  frequency: 0.9,
  ingredient: 1,
  skill: 1.2,
  energy: 1,
  exp: 1
};

export const GENTLE: Nature = {
  name: 'Gentle',
  prettyName: 'Gentle (+skill -energy)',
  positiveModifier: 'skill',
  negativeModifier: 'energy',
  frequency: 1,
  ingredient: 1,
  skill: 1.2,
  energy: 0.88,
  exp: 1
};

export const CAREFUL: Nature = {
  name: 'Careful',
  prettyName: 'Careful (+skill -ing)',
  positiveModifier: 'skill',
  negativeModifier: 'ingredient',
  frequency: 1,
  ingredient: 0.8,
  skill: 1.2,
  energy: 1,
  exp: 1
};

export const SASSY: Nature = {
  name: 'Sassy',
  prettyName: 'Sassy (+skill -exp)',
  positiveModifier: 'skill',
  negativeModifier: 'exp',
  frequency: 1,
  ingredient: 1,
  skill: 1.2,
  energy: 1,
  exp: 0.82
};

// --- EXP + --- //
export const TIMID: Nature = {
  name: 'Timid',
  prettyName: 'Timid (+exp -speed)',
  positiveModifier: 'exp',
  negativeModifier: 'speed',
  frequency: 0.9,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1.18
};

export const HASTY: Nature = {
  name: 'Hasty',
  prettyName: 'Hasty (+exp -energy)',
  positiveModifier: 'exp',
  negativeModifier: 'energy',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 0.88,
  exp: 1.18
};

export const JOLLY: Nature = {
  name: 'Jolly',
  prettyName: 'Jolly (+exp -ing)',
  positiveModifier: 'exp',
  negativeModifier: 'ingredient',
  frequency: 1,
  ingredient: 0.8,
  skill: 1,
  energy: 1,
  exp: 1.18
};
export const NAIVE: Nature = {
  name: 'Naive',
  prettyName: 'Naive (+exp -skill)',
  positiveModifier: 'exp',
  negativeModifier: 'skill',
  frequency: 1,
  ingredient: 1,
  skill: 0.8,
  energy: 1,
  exp: 1.18
};

// --- NEUTRAL --- //
export const BASHFUL: Nature = {
  name: 'Bashful',
  prettyName: 'Bashful (neutral)',
  positiveModifier: 'neutral',
  negativeModifier: 'neutral',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1
};
export const HARDY: Nature = {
  name: 'Hardy',
  prettyName: 'Hardy (neutral)',
  positiveModifier: 'neutral',
  negativeModifier: 'neutral',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1
};
export const DOCILE: Nature = {
  name: 'Docile',
  prettyName: 'Docile (neutral)',
  positiveModifier: 'neutral',
  negativeModifier: 'neutral',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1
};
export const QUIRKY: Nature = {
  name: 'Quirky',
  prettyName: 'Quirky (neutral)',
  positiveModifier: 'neutral',
  negativeModifier: 'neutral',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1
};
export const SERIOUS: Nature = {
  name: 'Serious',
  prettyName: 'Serious (neutral)',
  positiveModifier: 'neutral',
  negativeModifier: 'neutral',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1
};

export const NATURES: Nature[] = [
  LONELY,
  ADAMANT,
  NAUGHTY,
  BRAVE,
  BOLD,
  IMPISH,
  LAX,
  RELAXED,
  MODEST,
  MILD,
  RASH,
  QUIET,
  CALM,
  GENTLE,
  CAREFUL,
  SASSY,
  TIMID,
  HASTY,
  JOLLY,
  NAIVE,
  BASHFUL,
  HARDY,
  DOCILE,
  QUIRKY,
  SERIOUS
];
