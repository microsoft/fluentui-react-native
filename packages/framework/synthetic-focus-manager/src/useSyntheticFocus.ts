import * as React from 'react';

import type { IFocusable } from '@fluentui-react-native/interactive-hooks';

import type {
  ISyntheticFocusManager,
  SyntheticFocusManagerItem,
  SyntheticFocusManagerListeners,
  SyntheticFocusState,
} from './SyntheticFocusManager.types';

/**
 * Given a focus manager, this hook attaches important listeners to the manager.
 *
 * @returns `SyntheticFocusState` stating whether the manager is active and what element is currently focused by the manager
 */
export const useSyntheticFocusState = (
  ref: React.RefObject<any>,
  focusManager?: ISyntheticFocusManager,
  listeners?: SyntheticFocusManagerListeners,
): SyntheticFocusState | undefined => {
  const [active, setActive] = React.useState<boolean>(false);
  const [focusedRef, setFocusedRef] = React.useState<React.RefObject<IFocusable> | undefined>(undefined);

  React.useEffect(() => {
    if (focusManager) {
      focusManager.addListeners(ref, {
        onFocusManagerEnable: () => {
          setActive(true);
          listeners?.onFocusManagerEnable?.();
        },
        onFocusManagerDisable: () => {
          setActive(false);
          listeners?.onFocusManagerDisable?.();
        },
        onFocusChange: (item) => {
          setFocusedRef(item?.ref);
          listeners?.onFocusChange?.(item);
        },
      });
    }
    return () => focusManager && focusManager.removeListeners(ref);
  }, [ref, focusManager, listeners]);

  return React.useMemo(
    () =>
      focusManager
        ? {
            active: active,
            focusManager: focusManager,
            focusedRef: focusedRef,
          }
        : undefined,
    [active, focusManager, focusedRef],
  );
};

/**
 * Given a `SyntheticFocusState`, this hook should be called by an element that wants to render synthetic focus.
 *
 * @returns boolean flag of whether "fake" focus is active for this element
 */
export const useSyntheticFocus = (item: SyntheticFocusManagerItem, state?: SyntheticFocusState): boolean => {
  const focusManager = state?.focusManager;
  const ref = item.ref;

  React.useEffect(() => {
    if (focusManager) {
      focusManager.register(item);
    }
    return () => focusManager && focusManager.unregister(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusManager]);

  return state && state.active && state.focusedRef === ref;
};
