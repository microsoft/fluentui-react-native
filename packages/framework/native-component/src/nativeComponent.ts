import { getMemoCache } from '@fluentui-react-native/memo-cache';
import { requireNativeComponent, HostComponent } from 'react-native';

const nativeComponentCache = getMemoCache();

/**
 * Get a native component of the given name, requiring it if necessary
 * @param name - name of the component to retrieve from the cache
 */
export function nativeComponent<T>(name: string): HostComponent<T> {
  return nativeComponentCache(() => requireNativeComponent(name), [name])[0];
}
