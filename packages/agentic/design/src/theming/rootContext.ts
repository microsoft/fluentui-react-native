import * as React from 'react';

export type InputModality = 'keyboard' | 'pointer';

export interface RootContextValue {
  /**
   * Last input modality observed by the scene root. Initially `pointer`.
   * Read this in event handlers; changes do not trigger a render.
   */
  readonly inputModality: InputModality;
}

export const RootContext = React.createContext<RootContextValue | undefined>(undefined);

/**
 * Returns the stable, live scene state shared by nested ThemedRoots.
 */
export function useRootContext(): RootContextValue {
  const root = React.useContext(RootContext);
  if (!root) {
    throw new Error('useRootContext must be used within a ThemedRoot.');
  }
  return root;
}
