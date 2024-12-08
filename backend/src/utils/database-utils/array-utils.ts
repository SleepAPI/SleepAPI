export function chunkArray<T>(array: Array<T>, chunkSize: number): Iterable<Array<T>> {
  const shallowCopy = [...array];

  return {
    [Symbol.iterator]: () => ({
      next() {
        if (shallowCopy.length === 0) {
          return {
            done: true,
            value: []
          };
        } else {
          return { done: false, value: shallowCopy.splice(0, chunkSize) };
        }
      }
    })
  };
}
