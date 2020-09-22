/**
 *  If we have a userAgent string, let's assume we're web debugging.  __DEV__ is for developer bundles.  Currently,
 *  react-native only polyfills navigator with { product: 'ReactNative', geolocation: NativeModules.Geolocation }
 */
export function enableNativeModule(): boolean {
  const disabled = __DEV__ && navigator && navigator.userAgent !== undefined;
  disabled && console.warn(console.warn('Web Debugging forces Theming Native Module to fallback to fake color values.'));
  return !disabled;
}
