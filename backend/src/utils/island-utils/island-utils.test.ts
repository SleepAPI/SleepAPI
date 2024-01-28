import { island } from 'sleepapi-common';
import { findIslandForName } from './island-utils';

describe('findIslandForName Function Tests', () => {
  it.each(island.ISLANDS)('finds existing island "%s"', (island: island.Island) => {
    const result = findIslandForName(island.name);
    expect(result).toEqual(island);
  });

  it('is case-insensitive when finding an island', () => {
    const testName = 'CyAn BeAcH';
    const result = findIslandForName(testName);
    expect(result).toEqual(island.CYAN);
  });

  it('shall return undefined for a non-existing island', () => {
    const result = findIslandForName('Nonexistent Island');
    expect(result).toBeUndefined();
  });

  it('shall return undefined for undefined input', () => {
    const result = findIslandForName(undefined);
    expect(result).toBeUndefined();
  });
});
