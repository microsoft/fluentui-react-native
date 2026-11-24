import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { I18nManager, Platform, TextInput } from 'react-native';
import { isSelfTargetEvent } from '@fluentui-react-native/framework-base';
import type { FocusIntent, FocusKeyboardEvent, FocusTarget } from '@fluentui-react-native/framework-base';

type FocusTargetEvent = Parameters<typeof isSelfTargetEvent>[0];

export type KeyedFocusEntry = { value: string; disabled?: boolean };
type MoveDirection = 'previous' | 'next' | 'first' | 'last' | 'up' | 'down';
type NavigationMode = 'horizontal' | 'vertical' | 'linear' | 'grid';
type FocusMove = { value: string; intent: FocusIntent };

function collectionKeys(mode: NavigationMode): Readonly<Record<string, MoveDirection | undefined>> {
  const horizontal = I18nManager.isRTL
    ? ({ ArrowLeft: 'next', ArrowRight: 'previous' } as const)
    : ({ ArrowLeft: 'previous', ArrowRight: 'next' } as const);
  return {
    ...(mode !== 'vertical' && horizontal),
    Home: 'first',
    End: 'last',
    ...((mode === 'vertical' || mode === 'linear') && { ArrowUp: 'previous', ArrowDown: 'next' }),
    ...(mode === 'grid' && { ArrowUp: 'up', ArrowDown: 'down' }),
  };
}

function currentHostFocus(): unknown {
  const native = TextInput as unknown as { State?: { currentlyFocusedInput?: () => unknown } };
  return native.State?.currentlyFocusedInput?.();
}

function linearMove(entries: readonly KeyedFocusEntry[], value: string, direction: MoveDirection): string | undefined {
  const enabled = entries.filter((entry) => !entry.disabled);
  const index = enabled.findIndex((entry) => entry.value === value);
  if (index < 0) return undefined;
  if (direction === 'first') return enabled[0].value;
  if (direction === 'last') return enabled[enabled.length - 1].value;
  if (direction === 'up' || direction === 'down') return undefined;
  const delta = direction === 'previous' ? -1 : 1;
  return enabled[(index + delta + enabled.length) % enabled.length].value;
}

export function useKeyedFocus(
  entries: readonly KeyedFocusEntry[],
  {
    entryValue,
    remember = false,
    mode,
    onNavigate,
    moveVertically,
    extraKeys,
    onOtherKey,
    recoverValue,
  }: {
    entryValue?: string | null;
    remember?: boolean;
    mode: NavigationMode;
    onNavigate?: (value: string) => void;
    moveVertically?: (value: string, direction: 'up' | 'down') => string | undefined;
    extraKeys?: readonly string[];
    onOtherKey?: (value: string, key: string) => boolean;
    recoverValue?: (value: string) => string | undefined;
  },
) {
  const [focusedValue, setFocusedValue] = useState<string>();
  const [rememberedValue, setRememberedValue] = useState<string>();
  const [pending, setPending] = useState<FocusMove>();
  const targets = useRef(new Map<string, FocusTarget>());
  const hostAtFocus = useRef<unknown>(undefined);
  const eligible = (value: string | null | undefined) => entries.some((entry) => entry.value === value && !entry.disabled);
  const preferred = (remember ? rememberedValue : entryValue) ?? undefined;
  const fallback = eligible(preferred) ? preferred : entries.find((entry) => !entry.disabled)?.value;
  const pendingValue = pending && eligible(pending.value) ? pending.value : undefined;
  const currentValue = eligible(focusedValue) ? focusedValue : undefined;
  const activeValue = pendingValue ?? currentValue ?? fallback;
  const focusedRemoved = focusedValue !== undefined && currentValue === undefined;

  const register = useCallback((value: string, target: FocusTarget) => {
    targets.current.set(value, target);
    return () => {
      if (targets.current.get(value) === target) targets.current.delete(value);
    };
  }, []);

  useLayoutEffect(() => {
    if (focusedRemoved) {
      setFocusedValue(undefined);
      const currentHost = currentHostFocus();
      const recovery = recoverValue?.(focusedValue) ?? fallback;
      if (!pendingValue && recovery && (currentHost == null || currentHost === hostAtFocus.current)) {
        setPending({ value: recovery, intent: 'restore' });
      }
    }
  }, [fallback, focusedRemoved, focusedValue, pendingValue, recoverValue]);

  useLayoutEffect(() => {
    if (!pending) return undefined;
    const request = pendingValue ? targets.current.get(pendingValue)?.requestFocus(pending.intent) : undefined;
    if (request?.status === 'confirmed') {
      setFocusedValue(pendingValue);
      setRememberedValue(pendingValue);
      hostAtFocus.current = currentHostFocus();
    }
    if (request?.status !== 'requested') setPending(undefined);
    return () => request?.cancel();
  }, [pending, pendingValue]);

  const keys = collectionKeys(mode);
  return {
    register,
    activeValue,
    focusedValue,
    requestFocus: (value: string, intent: FocusIntent) => {
      if (eligible(value)) setPending({ value, intent });
    },
    getProps(value: string) {
      return {
        focusable: value === activeValue,
        keyDownEvents:
          eligible(value) && String(Platform.OS) === 'win32'
            ? [...Object.keys(keys), ...(extraKeys ?? [])].map((key) => ({
                key,
                altKey: false,
                ctrlKey: false,
                metaKey: false,
                shiftKey: false,
              }))
            : undefined,
        onFocus: (event: FocusTargetEvent) => {
          if (!eligible(value) || !isSelfTargetEvent(event)) return;
          setFocusedValue(value);
          hostAtFocus.current = currentHostFocus();
          if (remember) setRememberedValue(value);
          setPending(undefined);
        },
        onBlur: (event: FocusTargetEvent) => {
          if (isSelfTargetEvent(event)) setFocusedValue((current) => (current === value ? undefined : current));
        },
        onKeyDown: (event: FocusKeyboardEvent) => {
          const { key, code, altKey, ctrlKey, metaKey, shiftKey } = event.nativeEvent;
          if (!eligible(value) || !isSelfTargetEvent(event) || event.defaultPrevented || altKey || ctrlKey || metaKey || shiftKey) return;
          const nativeKey = key && key !== 'Unidentified' ? key : code;
          const direction = nativeKey && Object.hasOwn(keys, nativeKey) ? keys[nativeKey] : undefined;
          if (!direction) {
            if (nativeKey && onOtherKey?.(value, nativeKey)) {
              event.preventDefault?.();
              event.stopPropagation?.();
            }
            return;
          }
          event.preventDefault?.();
          event.stopPropagation?.();
          const next =
            direction === 'up' || direction === 'down' ? moveVertically?.(value, direction) : linearMove(entries, value, direction);
          if (!next || next === value || !eligible(next)) return;
          onNavigate?.(next);
          setPending({ value: next, intent: 'keyboard' });
        },
      };
    },
  };
}

export type KeyedFocus = ReturnType<typeof useKeyedFocus>;
