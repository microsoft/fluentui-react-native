export function enableNativeModule(): boolean {
  // in RN Web just send this down the javascript only fallback codepath
  return false;
}
