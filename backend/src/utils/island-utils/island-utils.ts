import { island } from 'sleepapi-common';

export function findIslandForName(islandName?: string): island.Island | undefined {
  return island.ISLANDS.find((island) => island.name.toLowerCase() === islandName?.toLowerCase());
}
