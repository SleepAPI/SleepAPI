// TODO: move out of dbutils
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

// TEST
export function splitArrayByCondition<T>(
  array: Array<T>,
  conditionFn: (item: T) => boolean
): [truthy: T[], falsy: T[]] {
  const result: [T[], T[]] = [[], []];
  array.forEach((item) => (conditionFn(item) ? result[0] : result[1]).push(item));
  return result;
}

export function convertFloat32ToInt16(array: Float32Array) {
  const int16Array = new Int16Array(array.length);
  for (let i = 0; i < array.length; i++) {
    int16Array[i] = Math.round(array[i]);
  }
  return int16Array;
}
