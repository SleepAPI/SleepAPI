export interface GenderRatio {
  male: number;
  female: number;
}

export type PokemonGender = 'male' | 'female' | undefined;

export const BALANCED_GENDER: GenderRatio = {
  male: 0.5,
  female: 0.5,
};

export const GENDER_UNKNOWN: GenderRatio = {
  male: 0,
  female: 0,
};

export const MALE_ONLY: GenderRatio = {
  male: 1,
  female: 0,
};

export const SEVEN_EIGHTHS_MALE: GenderRatio = {
  male: 0.875,
  female: 0.125,
};

export const THREE_FOURTHS_MALE: GenderRatio = {
  male: 0.75,
  female: 0.25,
};

export const THREE_FOURTHS_FEMALE: GenderRatio = {
  male: 0.25,
  female: 0.75,
};

export const SEVEN_EIGHTHS_FEMALE: GenderRatio = {
  male: 0.125,
  female: 0.875,
};

export const FEMALE_ONLY: GenderRatio = {
  male: 0,
  female: 1,
};
