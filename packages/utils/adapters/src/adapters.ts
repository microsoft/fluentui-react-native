/**
 * filter functions aren't necessary at this point as react-native will ignore unknown props for core components.
 */

export function filterViewProps(_propName: string): boolean {
  return true;
}

export function filterTextProps(_propName: string): boolean {
  return true;
}

export function filterImageProps(_propName: string): boolean {
  return true;
}
