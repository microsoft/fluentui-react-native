export function mergeKeys(keys: string[]): string {
  return keys.join('|');
}

export function toKey(val?: any): { key: string | object; isObj: boolean } {
  const isObj = typeof val === 'object' || typeof val === 'function';
  return {
    key: isObj ? val : val + '',
    isObj
  };
}
