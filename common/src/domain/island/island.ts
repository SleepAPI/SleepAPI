import {
  Berry,
  CHERI,
  DURIN,
  FIGY,
  LEPPA,
  MAGO,
  ORAN,
  PAMTRE,
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI,
} from '../berry/berry';

export interface Island {
  name: string;
  berries: Berry[];
}

export const CYAN: Island = {
  name: 'Cyan beach',
  berries: [ORAN, PAMTRE, PECHA],
};
export const TAUPE: Island = {
  name: 'Taupe hollow',
  berries: [FIGY, LEPPA, SITRUS],
};
export const SNOWDROP: Island = {
  name: 'Snowdrop tundra',
  berries: [PERSIM, RAWST, WIKI],
};
export const LAPIS: Island = {
  name: 'Lapis lakeside',
  berries: [CHERI, DURIN, MAGO],
};

export const ISLANDS = [CYAN, TAUPE, SNOWDROP, LAPIS];
