import { describe, expect, it } from 'vitest';
import {
  BELUE,
  BLUK,
  CHERI,
  DURIN,
  FIGY,
  GREPA,
  LEPPA,
  MAGO,
  ORAN,
  PAMTRE,
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI
} from '../berry/berries';
import { CYAN, ISLANDS, LAPIS, POWER_PLANT, SNOWDROP, TAUPE } from './island';

describe('island', () => {
  it('CYAN island shall have the correct properties', () => {
    expect(CYAN.name).toBe('Cyan beach');
    expect(CYAN.berries).toEqual([ORAN, PAMTRE, PECHA]);
  });

  it('TAUPE island shall have the correct properties', () => {
    expect(TAUPE.name).toBe('Taupe hollow');
    expect(TAUPE.berries).toEqual([FIGY, LEPPA, SITRUS]);
  });

  it('SNOWDROP island shall have the correct properties', () => {
    expect(SNOWDROP.name).toBe('Snowdrop tundra');
    expect(SNOWDROP.berries).toEqual([PERSIM, RAWST, WIKI]);
  });

  it('LAPIS island shall have the correct properties', () => {
    expect(LAPIS.name).toBe('Lapis lakeside');
    expect(LAPIS.berries).toEqual([CHERI, DURIN, MAGO]);
  });

  it('POWER_PLANT island shall have the correct properties', () => {
    expect(POWER_PLANT.name).toBe('Old gold power plant');
    expect(POWER_PLANT.berries).toEqual([BELUE, BLUK, GREPA]);
  });

  it('ISLANDS array shall contain all islands', () => {
    expect(ISLANDS).toHaveLength(5);
    expect(ISLANDS).toContain(CYAN);
    expect(ISLANDS).toContain(TAUPE);
    expect(ISLANDS).toContain(SNOWDROP);
    expect(ISLANDS).toContain(LAPIS);
    expect(ISLANDS).toContain(POWER_PLANT);
  });
});
