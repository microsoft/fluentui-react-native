import * as React from 'react';

import type { IFocusable } from '@fluentui-react-native/interactive-hooks';

import type { ISyntheticFocusManager, SyntheticFocusManagerListeners, SyntheticFocusManagerState } from './SyntheticFocusManager.types';

export const useSyntheticFocusState = (
  ref: React.RefObject<any>,
  focusManager?: ISyntheticFocusManager,
  listeners?: SyntheticFocusManagerListeners,
): SyntheticFocusManagerState | undefined => {
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
