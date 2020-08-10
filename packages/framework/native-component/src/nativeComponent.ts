import { getMemoCache } from '@fluentui-react-native/memo-cache';
import { requireNativeComponent, HostComponent } from 'react-native';

const nativeComponentCache = getMemoCache();

export function nativeComponent<T>(name: string): HostComponent<T> {
  return nativeComponentCache(() => requireNativeComponent(name), [name])[0];
}
