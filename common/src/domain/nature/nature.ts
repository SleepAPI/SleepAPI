export interface Nature {
  name: string;
  prettyName: string;
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
  frequency: 1.1,
  ingredient: 1,
  skill: 1,
  energy: 0.88,
  exp: 1,
};

export const ADAMANT: Nature = {
  name: 'Adamant',
  prettyName: 'Adamant (+speed -ing)',
  frequency: 1.1,
  ingredient: 0.8,
  skill: 1,
  energy: 1,
  exp: 1,
};

export const NAUGHTY: Nature = {
  name: 'Naughty',
  prettyName: 'Naughty (+speed -skill)',
  frequency: 1.1,
  ingredient: 1,
  skill: 0.8,
  energy: 1,
  exp: 1,
};

export const BRAVE: Nature = {
  name: 'Brave',
  prettyName: 'Brave (+speed -exp)',
  frequency: 1.1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 0.8,
};

// --- ENERGY + --- //
export const BOLD: Nature = {
  name: 'Bold',
  prettyName: 'Bold (+energy -speed)',
  frequency: 0.9,
  ingredient: 1,
  skill: 1,
  energy: 1.2,
  exp: 1,
};

export const IMPISH: Nature = {
  name: 'Impish',
  prettyName: 'Impish (+energy -ing)',
  frequency: 1,
  ingredient: 0.8,
  skill: 1,
  energy: 1.2,
  exp: 1,
};

export const LAX: Nature = {
  name: 'Lax',
  prettyName: 'Lax (+energy -skill)',
  frequency: 1,
  ingredient: 1,
  skill: 0.8,
  energy: 1.2,
  exp: 1,
};

export const RELAXED: Nature = {
  name: 'Relaxed',
  prettyName: 'Relaxed (+energy -exp)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1.2,
  exp: 0.8,
};

// --- ING + --- //
export const MODEST: Nature = {
  name: 'Modest',
  prettyName: 'Modest (+ing -speed)',
  frequency: 0.9,
  ingredient: 1.2,
  skill: 1,
  energy: 1,
  exp: 1,
};
export const MILD: Nature = {
  name: 'Mild',
  prettyName: 'Mild (+ing -energy)',
  frequency: 1,
  ingredient: 1.2,
  skill: 1,
  energy: 0.88,
  exp: 1,
};

export const RASH: Nature = {
  name: 'Rash',
  prettyName: 'Rash (+ing -skill)',
  frequency: 1,
  ingredient: 1.2,
  skill: 0.8,
  energy: 1,
  exp: 1,
};
export const QUIET: Nature = {
  name: 'Quiet',
  prettyName: 'Quiet (+ing -exp)',
  frequency: 1,
  ingredient: 1.2,
  skill: 1,
  energy: 1,
  exp: 0.8,
};

// --- SKILL + --- //
export const CALM: Nature = {
  name: 'Calm',
  prettyName: 'Calm (+skill -speed)',
  frequency: 0.9,
  ingredient: 1,
  skill: 1.2,
  energy: 1,
  exp: 1,
};

export const GENTLE: Nature = {
  name: 'Gentle',
  prettyName: 'Gentle (+skill -energy)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 0.88,
  exp: 1,
};

export const CAREFUL: Nature = {
  name: 'Careful',
  prettyName: 'Careful (+skill -ing)',
  frequency: 1,
  ingredient: 0.8,
  skill: 1.2,
  energy: 1,
  exp: 1,
};

export const SASSY: Nature = {
  name: 'Sassy',
  prettyName: 'Sassy (+skill -exp)',
  frequency: 1,
  ingredient: 1,
  skill: 1.2,
  energy: 1,
  exp: 0.8,
};

// --- EXP + --- //
export const TIMID: Nature = {
  name: 'Timid',
  prettyName: 'Timid (+exp -speed)',
  frequency: 0.9,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1.2,
};

export const HASTY: Nature = {
  name: 'Hasty',
  prettyName: 'Hasty (+exp -energy)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 0.88,
  exp: 1.2,
};

export const JOLLY: Nature = {
  name: 'Jolly',
  prettyName: 'Jolly (+exp -ing)',
  frequency: 1,
  ingredient: 0.8,
  skill: 1,
  energy: 1,
  exp: 1.2,
};
export const NAIVE: Nature = {
  name: 'Naive',
  prettyName: 'Naive (+exp -skill)',
  frequency: 1,
  ingredient: 1,
  skill: 0.8,
  energy: 1,
  exp: 1.2,
};

// --- NEUTRAL --- //
export const BASHFUL: Nature = {
  name: 'Bashful',
  prettyName: 'Bashful (neutral)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1,
};
export const HARDY: Nature = {
  name: 'Hardy',
  prettyName: 'Hardy (neutral)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1,
};
export const DOCILE: Nature = {
  name: 'Docile',
  prettyName: 'Docile (neutral)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1,
};
export const QUIRKY: Nature = {
  name: 'Quirky',
  prettyName: 'Quirky (neutral)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1,
};
export const SERIOUS: Nature = {
  name: 'Serious',
  prettyName: 'Serious (neutral)',
  frequency: 1,
  ingredient: 1,
  skill: 1,
  energy: 1,
  exp: 1,
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
  SERIOUS,
];
