export function mergeKeys(keys: string[]): string {
  return keys.join('|') + '|' + keys.length;
}

export function toKey(val?: any): { key: string | object; isObj: boolean } {
  if (val === null) {
    return { key: 'null', isObj: false };
  } else {
    const isObj = typeof val === 'object' || typeof val === 'function';
    return {
      key: isObj ? val : val + '',
      isObj
    };
  }
}
