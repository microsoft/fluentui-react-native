import { useLayoutEffect, useRef } from 'react';
import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';

type Focusable = { focus(): void };

export function usePanelFocus(
  visible: ReadonlySet<string>,
  opener?: RefObject<Focusable | null>,
  resolveReplacement?: (key: string) => string | undefined,
) {
  const targets = useRef(new Map<string, ComponentRef<typeof View>>());
  const focused = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    const key = focused.current;
    if (key === undefined || visible.has(key)) return;
    focused.current = undefined;
    const successor = resolveReplacement?.(key);
    const target = successor === undefined ? undefined : targets.current.get(successor);
    if (target) target.focus();
    else opener?.current?.focus();
  }, [opener, resolveReplacement, visible]);

  return {
    setRef(key: string, instance: ComponentRef<typeof View> | null) {
      if (!instance) return undefined;
      targets.current.set(key, instance);
      return () => {
        if (targets.current.get(key) === instance) targets.current.delete(key);
      };
    },
    onFocus(key: string) {
      focused.current = key;
    },
    onBlur(key: string) {
      if (focused.current === key) focused.current = undefined;
    },
  };
}

export type PanelFocus = ReturnType<typeof usePanelFocus>;
