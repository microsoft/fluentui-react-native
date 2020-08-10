import { nativeComponent } from './nativeComponent';

/**
 * Late bind comopnent references. This will see if the component is referred to as a capitalized string. If so it will call
 * requireNativeComponent on it via the cache and return the resolved component. Lowercase strings are special and assumed to be included primitives.
 *
 * @param component - component which may be an actual component or a string
 */
export function lateBindComponent(component: React.ElementType<any> | string): React.ElementType<any> | string {
  return typeof component === 'string' && component[0] !== component[0].toLowerCase() ? nativeComponent(component) : component;
}
