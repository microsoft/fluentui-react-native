import * as React from 'react';

import type { InputModality, RootSettings } from './rootContext';

export interface RootInputController {
  readonly settings: RootSettings;
  getSnapshot(): InputModality;
  subscribe(listener: () => void): () => void;
  setInputModality(modality: InputModality): void;
}

export function createRootInputController(): RootInputController {
  let inputModality: InputModality = 'pointer';
  const listeners = new Set<() => void>();
  return {
    settings: Object.freeze({
      get inputModality() {
        return inputModality;
      },
    }),
    getSnapshot: () => inputModality,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setInputModality: (next) => {
      if (next !== inputModality) {
        inputModality = next;
        for (const listener of Array.from(listeners)) {
          listener();
        }
      }
    },
  };
}

export const RootInputContext = React.createContext<RootInputController | undefined>(undefined);

export function useRootInputController(): RootInputController {
  const controller = React.useContext(RootInputContext);
  if (!controller) {
    throw new Error('Root input tracking must be used within a ThemedRoot.');
  }
  return controller;
}
