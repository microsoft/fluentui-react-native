import * as React from 'react';

import { useRootSettings } from './rootContext';
import type { InputModality } from './rootContext';
import { useRootInputController } from './rootInputController';

const noSubscription = () => () => undefined;

/**
 * Observes modality without replacing RootSettings or rerendering the scene.
 * Unfocused consumers can opt out of notifications while still reading the snapshot.
 */
export function useRootInputModality(subscribe = true): InputModality {
  const controller = useRootInputController();
  const settings = useRootSettings();
  const getSnapshot = React.useCallback(() => settings.inputModality, [settings]);
  return React.useSyncExternalStore(subscribe ? controller.subscribe : noSubscription, getSnapshot, getSnapshot);
}
