export function arrayDifference<S, T>(
  source: Array<S>,
  target: Array<T>,
  compare: (a: S, b: T) => boolean
): { added: Array<T>; removed: Array<S> } {
  const added = target.filter((t) => !source.some((s) => compare(s, t)));
  const removed = source.filter((s) => !target.some((t) => compare(s, t)));
  return { added, removed };
}

export function chunkArray<T>(array: Array<T>, chunkSize: number): Iterable<Array<T>> {
  const shallowCopy = [...array];

  return {
    [Symbol.iterator]: () => ({
      next() {
        if (shallowCopy.length === 0) {
          return {
            done: true,
            value: [],
          };
        } else {
          return { done: false, value: shallowCopy.splice(0, chunkSize) };
        }
      },
    }),
  };
}
