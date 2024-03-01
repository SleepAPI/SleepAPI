import { CURRIES } from './curry';
import { DESSERTS } from './dessert';
import { SALADS } from './salad';

export * as curry from './curry';
export * as dessert from './dessert';
export * from './recipe';
export * as salad from './salad';

export const RECIPES = [...CURRIES, ...SALADS, ...DESSERTS];
