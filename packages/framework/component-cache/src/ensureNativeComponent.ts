import { requireNativeComponent, HostComponent } from 'react-native';

const cache: { [key: string]: HostComponent<any> } = {};

/**
 * Get a native component of the given name, requiring it if necessary
 * @param name - name of the component to retrieve from the cache
 */
export function ensureNativeComponent<T>(name: string): HostComponent<T> {
  return cache[name] || requireNativeComponent(name);
}
