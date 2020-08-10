import * as React from 'react';
import { queryNativeComponent } from './queryNativeComponent';
import { HostComponent } from 'react-native';

/**
 * Basic wrapper around native components.
 */
export type LateBindableComponent<T> = React.FunctionComponent<T> & { _bind?: () => HostComponent<T> };

/**
 * Late bind comopnent references. This will see if the component is referred to as a capitalized string. If so it will call
 * requireNativeComponent on it via the cache and return the resolved component. Lowercase strings are special and assumed to be included primitives.
 *
 * @param component - component which may be an actual component or a string
 */
export function lateBindComponent(component: React.ElementType<any> | string): React.ElementType<any> | string {
  return typeof component === 'function' && (component as LateBindableComponent<any>)._bind
    ? (component as LateBindableComponent<any>)._bind()
    : component;
}

/**
 * Callable deferred binding wrapper around native components
 * @param name - name of the native component that should be required
 */
export function NativeComponent<T>(name: string): LateBindableComponent<T> {
  const fn: LateBindableComponent<T> = (props: T) => {
    const Inner = queryNativeComponent(name);
    return <Inner {...props} />;
  };
  fn._bind = () => queryNativeComponent(name);
  return fn;
}
