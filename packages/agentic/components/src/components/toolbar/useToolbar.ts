import * as React from 'react';
import { I18nManager, Platform, View } from 'react-native';
import { useSlot } from '@fluentui-react-native/framework-base';
import type { FocusIntent, FocusRequest, FocusTarget } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { forbiddenToolbarRootProps, getToolbarInventory } from './toolbar.children';
import type { ToolbarItem } from './toolbar.children';
import type { ToolbarContextValue } from './ToolbarContext';
import type { ToolbarProps, ToolbarState } from './toolbar.types';

type Registration = { target: FocusTarget; unsubscribe: () => void };
type PendingFocus = {
  value: string;
  previous: string | undefined;
  target: FocusTarget | undefined;
  generation: number | undefined;
  intent: FocusIntent;
  request?: FocusRequest;
};

export function useToolbar_unstable(props: ToolbarProps): ToolbarState {
  const { children, direction: directionProp, size: sizeProp, style, ...rest } = props;
  const direction = directionProp === 'ltr' || directionProp === 'rtl' ? directionProp : I18nManager.isRTL ? 'rtl' : 'ltr';
  const size = sizeProp === 'small' ? 'small' : 'large';
  const themeState = useThemeState();
  const inventory = React.useMemo(() => getToolbarInventory(props, direction), [direction, props]);
  const items = inventory.items;
  const platformError = ['macos', 'windows', 'win32'].includes(String(Platform.OS))
    ? ''
    : `root: platform "${Platform.OS}" is outside the desktop Toolbar contract`;
  const errors = [...inventory.errors, ...(platformError ? [platformError] : [])].join('; ');
  const valid = !errors;
  const firstEligible = valid ? items.find((item) => !item.disabled)?.value : undefined;
  const [storedActive, setActive] = React.useState<string | undefined>(firstEligible);
  const activeValue = valid && items.some((item) => item.value === storedActive && !item.disabled) ? storedActive : firstEligible;
  const registrations = React.useRef(new Map<string, Registration>());
  const committedItems = React.useRef<readonly ToolbarItem[]>(items);
  const pending = React.useRef<PendingFocus | undefined>(undefined);
  const [focusRevision, advanceFocusRevision] = React.useReducer((revision: number) => revision + 1, 0);

  const cancelPending = React.useCallback(() => {
    pending.current?.request?.cancel();
    pending.current = undefined;
  }, []);

  React.useEffect(() => {
    if (errors) console.error(`Toolbar rejected its command scope: ${errors}.`);
    else if (!items.length) console.warn('Toolbar requires at least one ToolbarButton command.');
  }, [errors, items.length]);

  React.useLayoutEffect(() => {
    committedItems.current = valid ? items : [];
    if (storedActive !== activeValue) setActive(activeValue);
    if (pending.current && (!valid || !items.some((item) => item.value === pending.current?.value && !item.disabled))) {
      cancelPending();
    }
  }, [activeValue, cancelPending, items, storedActive, valid]);

  const isCommittedEligible = React.useCallback(
    (value: string) => committedItems.current.some((item) => item.value === value && !item.disabled),
    [],
  );
  const register = React.useCallback(
    (value: string, target: FocusTarget) => {
      const previous = registrations.current.get(value);
      previous?.unsubscribe();
      if (pending.current?.value === value && pending.current.target && pending.current.target !== target) cancelPending();
      const registration: Registration = { target, unsubscribe: () => undefined };
      registrations.current.set(value, registration);
      registration.unsubscribe = target.subscribe(() => {
        if (registrations.current.get(value) !== registration) return;
        const work = pending.current;
        if (work?.value === value && work.target === target && work.generation !== target.generation) cancelPending();
        if (target.current && target.getSnapshot().focused && isCommittedEligible(value)) {
          setActive(value);
          cancelPending();
        } else if (work?.value === value && work.request?.status === 'cancelled') {
          cancelPending();
        }
      });
      return () => {
        registration.unsubscribe();
        if (registrations.current.get(value) === registration) {
          registrations.current.delete(value);
          if (pending.current?.value === value) cancelPending();
        }
      };
    },
    [cancelPending, isCommittedEligible],
  );

  React.useLayoutEffect(() => {
    const work = pending.current;
    if (!work || !isCommittedEligible(work.value)) return;
    if (work.request) return;
    const target = registrations.current.get(work.value)?.target;
    if (!target || (work.target && (target !== work.target || target.generation !== work.generation))) {
      console.warn(`Toolbar cannot focus "${work.value}": ${target ? 'cancelled' : 'not-mounted'}.`);
      cancelPending();
      setActive(work.previous);
      return;
    }
    work.target = target;
    work.generation = target.generation;
    const request = target.requestFocus(work.intent);
    // Native focus can synchronously confirm through the target subscription.
    if (pending.current !== work) {
      request.cancel();
      return;
    }
    work.request = request;
    if (request.status === 'confirmed') {
      cancelPending();
    } else if (request.status !== 'requested') {
      console.warn(`Toolbar cannot focus "${work.value}": ${request.status}.`);
      cancelPending();
      setActive(work.previous);
    }
  }, [cancelPending, focusRevision, isCommittedEligible, items]);

  React.useLayoutEffect(
    () => () => {
      cancelPending();
      registrations.current.forEach((registration) => registration.unsubscribe());
      registrations.current.clear();
    },
    [cancelPending],
  );

  const requestEntry = React.useCallback(
    (value: string, intent: FocusIntent) => {
      cancelPending();
      const target = registrations.current.get(value)?.target;
      pending.current = { value, previous: activeValue, target, generation: target?.generation, intent };
      setActive(value);
      advanceFocusRevision();
    },
    [activeValue, cancelPending],
  );

  const onKeyDown = React.useCallback<ToolbarContextValue['onKeyDown']>(
    (value, event) => {
      const native = event.nativeEvent;
      const key = native.key && native.key !== 'Unidentified' ? native.key : native.code;
      if (key === 'Tab') {
        cancelPending();
        return;
      }
      if (event.defaultPrevented || native.altKey || native.ctrlKey || native.metaKey || native.shiftKey) return;
      const enabled = items.filter((item) => !item.disabled);
      const index = enabled.findIndex((item) => item.value === value);
      if (index < 0) return;
      let nextIndex: number;
      if (key === 'Home') nextIndex = 0;
      else if (key === 'End') nextIndex = enabled.length - 1;
      else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        const forward = key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
        nextIndex = (index + (forward ? 1 : -1) + enabled.length) % enabled.length;
      } else return;
      event.preventDefault?.();
      event.stopPropagation?.();
      const nextValue = enabled[nextIndex].value;
      if (nextValue !== value) requestEntry(nextValue, 'keyboard');
    },
    [cancelPending, direction, items, requestEntry],
  );

  const onFocus = React.useCallback(
    (value: string) => {
      const target = registrations.current.get(value)?.target;
      if (isCommittedEligible(value) && target?.current && target.getSnapshot().focused) {
        setActive(value);
        cancelPending();
      }
    },
    [cancelPending, isCommittedEligible],
  );

  const onBlur = React.useCallback(
    (value: string) => {
      const work = pending.current;
      if (!work) return;
      if (work.value === value) {
        cancelPending();
      } else {
        // Allow the paired destination focus event in this native turn, but do
        // not retain an outstanding request after focus leaves the scope.
        queueMicrotask(() => {
          if (pending.current === work && !work.target?.getSnapshot().focused) cancelPending();
        });
      }
    },
    [cancelPending],
  );

  const onPress = React.useCallback(
    (value: string) => {
      if (!isCommittedEligible(value)) return;
      if (value !== activeValue && (Platform.OS === 'windows' || String(Platform.OS) === 'win32')) {
        requestEntry(value, 'pointer');
      } else {
        cancelPending();
        setActive(value);
      }
    },
    [activeValue, cancelPending, isCommittedEligible, requestEntry],
  );

  const contextValue = React.useMemo<ToolbarContextValue>(
    () => ({
      activeValue,
      size,
      isEligible: (value) => valid && items.some((item) => item.value === value && !item.disabled),
      register,
      onFocus,
      onBlur,
      onKeyDown,
      onPress,
    }),
    [activeValue, items, onBlur, onFocus, onKeyDown, onPress, register, size, valid],
  );
  const nativeRest = Object.fromEntries(Object.entries(rest).filter(([key]) => !forbiddenToolbarRootProps.includes(key)));
  const root = useSlot(View, {
    ...nativeRest,
    accessibilityRole: 'toolbar',
    accessible: true,
    focusable: false,
  });
  return { root, children: valid ? children : null, contextValue, direction, size, valid, userStyle: style, ...themeState };
}
