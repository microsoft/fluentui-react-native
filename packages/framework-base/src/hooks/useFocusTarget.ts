import * as React from 'react';

import { createFocusTarget, isSelfTargetEvent } from './focusTarget';
import type { FocusTarget, FocusTargetEvent } from './focusTarget';

export interface FocusTargetBinding {
  focusTarget: FocusTarget;
  focusTargetRef: React.RefCallback<object>;
}

export interface UseFocusTargetResult extends FocusTargetBinding {
  focused: boolean;
  onFocus(event: FocusTargetEvent): void;
  onBlur(event: FocusTargetEvent): void;
}

export function useFocusTarget(focusable = true): UseFocusTargetResult {
  const [controller] = React.useState(createFocusTarget);
  const detach = React.useRef<(() => void) | undefined>(undefined);
  const snapshot = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const focusTargetRef = React.useCallback<React.RefCallback<object>>(
    (instance) => {
      detach.current?.();
      detach.current = undefined;
      if (instance) {
        const cleanup = controller.attach(instance);
        detach.current = cleanup;
        if (Number.parseInt(React.version, 10) >= 19) {
          return cleanup;
        }
      }
      return undefined;
    },
    [controller],
  );

  React.useLayoutEffect(() => {
    controller.setFocusable(focusable);
  }, [controller, focusable]);

  const onFocus = React.useCallback(
    (event: FocusTargetEvent) => {
      if (isSelfTargetEvent(event)) {
        controller.onFocus();
      }
    },
    [controller],
  );
  const onBlur = React.useCallback(
    (event: FocusTargetEvent) => {
      if (isSelfTargetEvent(event)) {
        controller.onBlur();
      }
    },
    [controller],
  );

  return { focusTarget: controller, focusTargetRef, focused: focusable && snapshot.focused, onFocus, onBlur };
}
