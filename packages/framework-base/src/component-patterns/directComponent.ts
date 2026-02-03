import type { FunctionComponent } from './render.types';

/**
 * @param component functional component, usually a closure, to make into a direct component
 * @return the same component with the direct component flag set, return type is a pure function component
 */
export function directComponent<TProps>(component: FunctionComponent<TProps>): FunctionComponent<TProps> {
  return Object.assign(component, { _callDirect: true });
}
