import { ISLANDS, Island } from '../../domain/island/island';

export function findIslandForName(islandName?: string): Island | undefined {
  return ISLANDS.find((island) => island.name.toLowerCase() === islandName?.toLowerCase());
}
