import { GREPA, LEPPA } from 'src/domain/berry';
import { AddOneIngredient } from 'src/domain/event/event-util';
import { Pokemon } from 'src/domain/pokemon';

export interface Event {
  name: string;
  startDate: string;
  endDate: string;
  statModifier: (mon: Pokemon) => Pokemon;
}

export const ENTEI_RESEARCH: Event = {
  name: 'Entei Research',
  startDate: '2024-05-20',
  endDate: '2024-06-03',
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
  startDate: '2024-03-25',
  endDate: '2024-04-07',
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
  startDate: '2023-11-20',
  endDate: '2023-11-27',
  statModifier: (mon: Pokemon) => {
    return {
      skillPercentage: mon.skillPercentage * 1.5,
      ...mon,
    };
  },
};

export const NO_EVENT: Event = {
  name: 'No Event',
  startDate: '',
  endDate: '',
  statModifier: (mon: Pokemon) => mon,
};

export const EVENTS: Event[] = [ENTEI_RESEARCH, RAIKOU_RESEARCH, EEVEE_WEEK];
