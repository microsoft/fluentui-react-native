import type { HostComponent } from 'react-native';
import { requireNativeComponent } from 'react-native';

const cache: { [key: string]: HostComponent<any> } = {};

/**
 * Get a native component of the given name, requiring it if necessary
 * @param name - name of the component to retrieve from the cache
 */
export function ensureNativeComponent<T>(name: string): HostComponent<T> {
  if (!cache[name]) {
    cache[name] = requireNativeComponent<T>(name);
  }
  return cache[name];
}
