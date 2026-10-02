import * as React from 'react';
import { I18nManager, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { isSelfTargetEvent, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import type { FocusIntent, FocusKeyboardEvent, FocusRequest, FocusTarget } from '@fluentui-react-native/framework-base';

import { Label } from '../label/label';
import { getRadioGroupMembers, ownedGroupNativeProps, rejectRadioGroupOverrides, requireRadioGroupText } from './radio-group.children';
import type { RadioGroupContextValue } from './RadioGroupContext';
import type { RadioGroupProps, RadioGroupState } from './radio-group.types';

type PendingFocus = {
  value: string;
  from: string | undefined;
  answer: string | null;
  intent: FocusIntent;
};
type IssuedFocus = { pending: PendingFocus; target: FocusTarget; generation: number; request: FocusRequest };

export function useRadioGroup_unstable(props: RadioGroupProps): RadioGroupState {
  const {
    label,
    children,
    selectedValue: controlledValue,
    defaultSelectedValue,
    onSelectionChange,
    orientation = 'vertical',
    direction = I18nManager.isRTL ? 'rtl' : 'ltr',
    required = false,
    disabled = false,
    accessibilityLabel = label,
    accessibilityState,
    style: userStyle,
    ...rest
  } = props;
  rejectRadioGroupOverrides(props, [...ownedGroupNativeProps, 'aria-label', 'aria-labelledby', 'accessibilityLabelledBy'], 'RadioGroup');
  requireRadioGroupText(label, 'label');
  requireRadioGroupText(accessibilityLabel, 'accessibilityLabel');
  if (controlledValue !== undefined && controlledValue !== null) requireRadioGroupText(controlledValue, 'selectedValue');
  if (orientation !== 'vertical' && orientation !== 'horizontal') throw new Error('RadioGroup: unsupported orientation.');
  if (direction !== 'ltr' && direction !== 'rtl') throw new Error('RadioGroup: unsupported direction.');
  if (
    accessibilityState &&
    ('checked' in accessibilityState ||
      'selected' in accessibilityState ||
      'disabled' in accessibilityState ||
      'required' in accessibilityState ||
      'multiselectable' in accessibilityState)
  ) {
    throw new Error('RadioGroup: checked, selected, disabled, required and multiselectable accessibility state are not group props.');
  }
  const members = React.useMemo(() => getRadioGroupMembers(children, disabled), [children, disabled]);
  const controlled = controlledValue !== undefined;
  const initial = React.useRef<{ controlled: boolean; value: string | null } | undefined>(undefined);
  const initialValue = controlled ? controlledValue : (defaultSelectedValue ?? null);
  if (!initial.current) {
    if (initialValue !== null && !members.some((member) => member.value === initialValue)) {
      throw new Error(`RadioGroup: initial selected value "${initialValue}" is not a member.`);
    }
    initial.current = { controlled, value: initialValue };
  } else if (controlled !== initial.current.controlled) {
    throw new Error('RadioGroup: selection cannot switch between controlled and uncontrolled.');
  }
  const [storedValue, setSelectedValue] = useControllableValue<string | null>(controlledValue, initial.current.value, (value) =>
    onSelectionChange?.(value ?? null),
  );
  const selectedValue = storedValue ?? null;
  const [focusedValue, setFocusedValue] = React.useState<string | undefined>(undefined);
  const [pending, setPending] = React.useState<PendingFocus | undefined>(undefined);
  const targets = React.useRef(new Map<string, { target: FocusTarget }>());
  const issued = React.useRef<IssuedFocus | undefined>(undefined);
  const pendingRef = React.useRef(pending);
  pendingRef.current = pending;
  const answerRef = React.useRef(selectedValue);
  answerRef.current = selectedValue;
  const hasValue = members.some((member) => member.value === selectedValue);
  const eligible = React.useCallback(
    (value: string | undefined) => members.some((member) => member.value === value && !member.disabled),
    [members],
  );
  const firstEligible = members.find((member) => !member.disabled)?.value;
  const selectedEntry = selectedValue !== null && eligible(selectedValue) ? selectedValue : firstEligible;
  const acknowledged = pending && selectedValue === pending.value && eligible(pending.value);
  const activeValue = acknowledged ? pending.value : eligible(focusedValue) ? focusedValue : selectedEntry;

  const cancelFocus = React.useCallback(() => {
    issued.current?.request.cancel();
    issued.current = undefined;
    pendingRef.current = undefined;
    setPending(undefined);
  }, []);

  React.useEffect(() => {
    if (__DEV__ && controlled && defaultSelectedValue !== undefined) {
      console.error('RadioGroup: defaultSelectedValue is ignored while selectedValue is supplied.');
    }
  }, [controlled, defaultSelectedValue]);
  React.useEffect(() => {
    if (selectedValue !== null && !hasValue) {
      if (controlled) {
        if (__DEV__) console.error(`RadioGroup: selected value "${selectedValue}" is no longer a member.`);
      } else if (answerRef.current === selectedValue) {
        answerRef.current = null;
        setSelectedValue(null);
      }
    }
  }, [controlled, hasValue, selectedValue, setSelectedValue]);

  React.useLayoutEffect(() => {
    if (focusedValue !== undefined && !eligible(focusedValue)) setFocusedValue(undefined);
    if (!pending) return;
    if (pendingRef.current !== pending) return;
    if (
      !eligible(pending.value) ||
      (pending.from !== undefined && !eligible(pending.from)) ||
      (selectedValue !== pending.answer && selectedValue !== pending.value)
    ) {
      cancelFocus();
      return;
    }
    if (selectedValue !== pending.value) return;
    const previous = issued.current;
    if (previous?.pending === pending) {
      if (previous.target.current === null || previous.target.generation !== previous.generation || previous.request.status === 'cancelled')
        cancelFocus();
      return;
    }
    const target = targets.current.get(pending.value)?.target;
    if (!target) {
      console.warn(`RadioGroup cannot focus "${pending.value}": not-mounted.`);
      cancelFocus();
      return;
    }
    const request = target.requestFocus(pending.intent);
    if (request.status === 'confirmed') {
      setFocusedValue(pending.value);
      cancelFocus();
    } else if (request.status === 'requested') {
      issued.current = { pending, target, generation: target.generation, request };
    } else {
      console.warn(`RadioGroup cannot focus "${pending.value}": ${request.status}.`);
      cancelFocus();
    }
  }, [activeValue, cancelFocus, eligible, focusedValue, pending, selectedValue]);

  React.useEffect(
    () => () => {
      issued.current?.request.cancel();
      issued.current = undefined;
      pendingRef.current = undefined;
    },
    [],
  );

  const registerItem = React.useCallback(
    (value: string, target: FocusTarget) => {
      const existing = targets.current.get(value);
      if (existing && existing.target !== target) throw new Error(`RadioGroup: multiple live targets for "${value}".`);
      const registration = { target };
      targets.current.set(value, registration);
      const unsubscribe = target.subscribe(() => {
        if (targets.current.get(value) !== registration) return;
        const current = issued.current;
        if (current?.target === target && (target.current === null || target.generation !== current.generation)) cancelFocus();
      });
      return () => {
        unsubscribe();
        if (targets.current.get(value) === registration) {
          targets.current.delete(value);
          if (pendingRef.current?.value === value || pendingRef.current?.from === value) cancelFocus();
        }
      };
    },
    [cancelFocus],
  );

  const onItemSelect = React.useCallback(
    (value: string, intent?: FocusIntent) => {
      if (!eligible(value)) return;
      if (intent) {
        if (pendingRef.current?.value !== value || pendingRef.current.intent !== intent) {
          issued.current?.request.cancel();
          issued.current = undefined;
          const next = { value, from: focusedValue, answer: selectedValue, intent };
          pendingRef.current = next;
          setPending(next);
        }
      } else {
        cancelFocus();
      }
      if (answerRef.current !== value) {
        if (!controlled) answerRef.current = value;
        setSelectedValue(value);
      }
    },
    [cancelFocus, controlled, eligible, focusedValue, selectedValue, setSelectedValue],
  );

  const onItemFocus = React.useCallback(
    (value: string) => {
      if (!eligible(value)) return;
      setFocusedValue(value);
      cancelFocus();
    },
    [cancelFocus, eligible],
  );
  const onItemBlur = React.useCallback(
    (value: string) => {
      setFocusedValue((current) => (current === value ? undefined : current));
      queueMicrotask(() => {
        if (!Array.from(targets.current.values()).some(({ target }) => target.current && target.getSnapshot().focused)) {
          cancelFocus();
        }
      });
    },
    [cancelFocus],
  );
  const onItemKeyDown = React.useCallback(
    (value: string, event: FocusKeyboardEvent) => {
      if (!isSelfTargetEvent(event)) return;
      const native = event.nativeEvent;
      const key = native.key && native.key !== 'Unidentified' ? native.key : native.code;
      if (key === 'Tab') {
        cancelFocus();
        return;
      }
      if (event.defaultPrevented || native.altKey || native.ctrlKey || native.metaKey || native.shiftKey || !eligible(value)) return;
      const enabled = members.filter((member) => !member.disabled);
      const index = enabled.findIndex((member) => member.value === value);
      let next: number;
      if (key === 'Home') next = 0;
      else if (key === 'End') next = enabled.length - 1;
      else if (key === 'ArrowDown' || key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')) next = (index + 1) % enabled.length;
      else if (key === 'ArrowUp' || key === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft'))
        next = (index - 1 + enabled.length) % enabled.length;
      else return;
      event.preventDefault?.();
      event.stopPropagation?.();
      const nextValue = enabled[next].value;
      onItemSelect(nextValue, nextValue === value ? undefined : 'keyboard');
    },
    [cancelFocus, direction, eligible, members, onItemSelect],
  );

  const contextValue: RadioGroupContextValue = {
    activeValue,
    focusedValue,
    selectedValue,
    disabled,
    getPosition: (value) => members.findIndex((member) => member.value === value) + 1,
    setSize: members.length,
    isEligible: (value) => eligible(value),
    registerItem,
    onItemFocus,
    onItemBlur,
    onItemKeyDown,
    onItemSelect,
  };
  const themeState = useThemeState();
  const root = useSlot(
    View,
    { ...rest, accessibilityLabel },
    {
      transform: (slotProps) => ({
        ...slotProps,
        accessibilityRole: 'radiogroup',
        role: undefined,
        accessible: true,
        focusable: false,
        tabIndex: -1,
        accessibilityState: { ...accessibilityState, disabled },
      }),
    },
  );
  const legend = useSlot(Label, { content: label, weight: 'strong', size: 'medium', required, disabled, accessible: false });
  const options = useSlot(View, { accessible: false, focusable: false });
  return {
    root,
    legend,
    options,
    children,
    contextValue,
    orientation,
    direction,
    disabled,
    required,
    selectedValue,
    userStyle,
    ...themeState,
  };
}
