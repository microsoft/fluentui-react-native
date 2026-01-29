import type React from 'react';

/**
 * @param component functional component, usually a closure, to make into a direct component
 * @return the same component with the direct component flag set, return type is a pure function component
 */
export function directComponent<TProps>(component: React.FunctionComponent<TProps>): React.FunctionComponent<TProps> {
  return Object.assign(component, { _callDirect: true });
}
