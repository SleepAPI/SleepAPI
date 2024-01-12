function isEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!isEqual(obj1[key], obj2[key])) {
        return false;
      }
    } else {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  }

  return true;
}

export function setMap(map: Map<any, any>, obj: any, value: any) {
  for (const key of map.keys()) {
    if (isEqual(key, obj)) {
      map.set(key, value);
      return;
    }
  }

  map.set(obj, value);
}

export function getMap(map: Map<any, any>, obj: any): any | undefined {
  for (const key of map.keys()) {
    if (isEqual(key, obj)) {
      return map.get(key);
    }
  }

  return undefined;
}
