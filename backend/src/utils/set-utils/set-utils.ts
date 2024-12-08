/**
 * @returns new filtered Set without modifying the original Set
 */
// TODO: test
export function filterSet(originalSet: Set<string>, valueToExclude: string): Set<string> {
  const resultSet = new Set<string>();
  for (const item of originalSet) {
    if (item !== valueToExclude) {
      resultSet.add(item);
    }
  }
  return resultSet;
}
