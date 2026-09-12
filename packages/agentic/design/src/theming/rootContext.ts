import * as React from 'react';

export type InputModality = 'keyboard' | 'pointer';

export interface RootSettings {
  /**
   * Last input modality observed by the scene root. Initially `pointer`.
   * Read this in event handlers; changes do not trigger a render.
   */
  readonly inputModality: InputModality;
}

export const RootContext = React.createContext<RootSettings | undefined>(undefined);

/**
 * Returns the stable, live scene state shared by nested ThemedRoots.
 */
export function useRootSettings(): RootSettings {
  const root = React.useContext(RootContext);
  if (!root) {
    throw new Error('useRootSettings must be used within a ThemedRoot.');
  }
  return root;
}
