export const undefinedText = '(undefined)';

export function getAllEnumValues<T extends object>(o: T): string[] {
  const results = Object.keys(o).filter(item => {
    return isNaN(Number(item));
  });
  results.unshift(undefinedText);
  return results;
}
