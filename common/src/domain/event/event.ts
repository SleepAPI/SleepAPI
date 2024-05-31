import { AddOneIngredient } from '../../utils';
import { GREPA, LEPPA } from '../berry';
import { Pokemon } from '../pokemon';

export interface Event {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  statModifier: (mon: Pokemon) => Pokemon;
}

export const FIRST_ANNIVERSARY_FEST: Event = {
  name: 'First Anniversary Fest',
  description: "The chance of each helper Pokemon's main skill triggering will be multiplied by 1.5.",
  startDate: new Date(2024, 7, 15),
  endDate: new Date(2024, 7, 21),
  statModifier: (mon: Pokemon) => {
    return {
      skillPercentage: mon.skillPercentage * 1.5,
      ...mon,
    };
  },
};

export const ENTEI_RESEARCH: Event = {
  name: 'Entei Research',
  description:
    'Fire-type Pokemon find an extra ingredient every time they find ingredients, and their main ' +
    'skill triggers 50% more often. During the first week, fire-type Pokemon have their main ' +
    'skill level increased by 1; during the second week, it increases by 3.',
  startDate: new Date(2024, 5, 20),
  endDate: new Date(2024, 6, 3),
  statModifier: (mon: Pokemon) => {
    if (mon.berry != LEPPA) {
      return mon;
    }
    return {
      ingredient0: AddOneIngredient(mon.ingredient0),
      ingredient30: mon.ingredient30.map(AddOneIngredient),
      ingredient60: mon.ingredient60.map(AddOneIngredient),
      skillPercentage: mon.skillPercentage * 1.5,
      ...mon,
      // For week 1, Main Skill Level is increased by 1
      // For week 2, Main Skill Level is increased by 3
    };
  },
};

export const RAIKOU_RESEARCH: Event = {
  name: 'Raikou Research',
  description:
    'Electric-type Pokemon find an extra ingredient every time they find ingredients, and their ' +
    'main skill triggers 50% more often.',
  startDate: new Date(2024, 3, 25),
  endDate: new Date(2024, 4, 7),
  statModifier: (mon: Pokemon) => {
    if (mon.berry != GREPA) {
      return mon;
    }
    return {
      ingredient0: AddOneIngredient(mon.ingredient0),
      ingredient30: mon.ingredient30.map(AddOneIngredient),
      ingredient60: mon.ingredient60.map(AddOneIngredient),
      skillPercentage: mon.skillPercentage * 1.5,
      ...mon,
    };
  },
};

export const EEVEE_WEEK: Event = {
  name: 'Eevee Week',
  description: 'Main skills trigger 50% more often.',
  startDate: new Date(2023, 11, 20),
  endDate: new Date(2023, 11, 27),
  statModifier: (mon: Pokemon) => {
    return {
      skillPercentage: mon.skillPercentage * 1.5,
      ...mon,
    };
  },
};

export const NO_EVENT: Event = {
  name: 'No Event',
  description: 'No changes.',
  startDate: new Date(0),
  endDate: new Date(Infinity),
  statModifier: (mon: Pokemon) => mon,
};

export const EVENTS: Event[] = [FIRST_ANNIVERSARY_FEST, ENTEI_RESEARCH, RAIKOU_RESEARCH, EEVEE_WEEK];
