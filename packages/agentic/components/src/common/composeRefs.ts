import type * as React from 'react';

/** One ref callback that sets every given ref and clears each through its cleanup, or with null, on detach. */
export function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (instance: T | null) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        return ref(instance);
      }
      if (ref) {
        (ref as React.RefObject<T | null>).current = instance;
      }
      return undefined;
    });
    return () => {
      cleanups.forEach((cleanup, index) => {
        const ref = refs[index];
        if (typeof cleanup === 'function') {
          cleanup();
        } else if (typeof ref === 'function') {
          ref(null);
        } else if (ref) {
          (ref as React.RefObject<T | null>).current = null;
        }
      });
    };
  };
}
