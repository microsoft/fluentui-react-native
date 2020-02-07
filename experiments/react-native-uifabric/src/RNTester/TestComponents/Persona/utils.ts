export function getAllEnumValues<T extends object>(o: T): string[] {
  return Object.keys(o).filter(item => {
    return isNaN(Number(item));
  });
}
