import * as React from 'react';

/**
 * Get a native component of the given name, requiring it if necessary
 * @param name - name of the component to retrieve from the cache
 */
export function ensureNativeComponent<T>(name: string): React.FunctionComponent<T> {
  return () => {
    throw `requireNativeComponent(${name}) isn't supported on web`;
  };
}
