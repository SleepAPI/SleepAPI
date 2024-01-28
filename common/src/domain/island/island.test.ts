import { CHERI, DURIN, FIGY, LEPPA, MAGO, ORAN, PAMTRE, PECHA, PERSIM, RAWST, SITRUS, WIKI } from '../berry/berry';
import { CYAN, ISLANDS, LAPIS, SNOWDROP, TAUPE } from './island';

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

  it('ISLANDS array shall contain all islands', () => {
    expect(ISLANDS).toHaveLength(4);
    expect(ISLANDS).toContain(CYAN);
    expect(ISLANDS).toContain(TAUPE);
    expect(ISLANDS).toContain(SNOWDROP);
    expect(ISLANDS).toContain(LAPIS);
  });
});
