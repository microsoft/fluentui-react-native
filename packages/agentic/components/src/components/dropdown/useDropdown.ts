import * as React from 'react';
import { Platform, Pressable, Text as NativeText, View } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent } from 'react-native';

import { useRootInputModality, useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useFocusablePressable, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import type {
  FocusablePressableProps,
  FocusIntent,
  FocusKeyboardEvent,
  FocusRequest,
  FocusTarget,
} from '@fluentui-react-native/framework-base';

import { semanticIconSources } from '../../common/iconSources';
import { withTriggerExpandActions } from '../../common/triggerExpandActions';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { Icon } from '../../primitives/icon/icon';
import { getInputResolvedStyles } from '../input/input.styles';
import type { InputVisualState } from '../input/input.types';
import type { ListboxItemOptionAction } from '../listbox-item/listboxItemOptionContext';
import { useDropdownController } from './dropdownController';
import { collectDropdownOptions, getDisplayedOptions } from './dropdownOptions';
import { getDropdownChevronColor } from './dropdown.styles';
import type { DropdownProps, DropdownState } from './dropdown.types';

const defaultPlaceholder = 'Select an option';
const defaultFormatSelectedCount = (count: number) => `${count} selected`;
const triggerKeys = [{ key: 'ArrowDown' }, { key: 'ArrowUp' }];
const unmounted: FocusRequest = { status: 'not-mounted', cancel: () => undefined };
const noSelection: readonly string[] = [];

type TriggerInstance = React.ComponentRef<typeof View>;

function composeHandlers<TArgs extends unknown[]>(...handlers: (((...args: TArgs) => void) | undefined)[]) {
  return (...args: TArgs) => {
    for (const handler of handlers) {
      handler?.(...args);
    }
  };
}

function getVisualState(state: {
  disabled: boolean;
  error: boolean;
  focused: boolean;
  pressed: boolean;
  hovered: boolean;
}): InputVisualState {
  if (state.disabled) {
    return 'disabled';
  }
  if (state.error) {
    return 'error';
  }
  if (state.focused) {
    return 'focused';
  }
  if (state.pressed) {
    return 'pressed';
  }
  if (state.hovered) {
    return 'hovered';
  }
  return 'rest';
}

function sameSelection(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Resolves Dropdown state: Input's chrome on a combobox trigger, the displayed selection, the selection policy, and the
 * native list popup it presents below the trigger.
 */
export function useDropdown_unstable(props: DropdownProps): DropdownState {
  const {
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityState,
    accessible,
    children,
    defaultOpen,
    defaultSelectedOptions,
    disabled = false,
    error = false,
    focusable,
    formatSelectedCount = defaultFormatSelectedCount,
    iconStart: iconStartProp,
    listbox,
    multiselect = false,
    onBlur,
    onFocus,
    onHoverIn,
    onHoverOut,
    onOpenChange,
    onPressIn,
    onPressOut,
    onSelectedOptionsChange,
    open,
    placeholder = defaultPlaceholder,
    selectedOptions: selectedOptionsProp,
    size = 'medium',
    style: userStyle,
    testID,
    trigger: triggerProp,
    variant = 'outline',
    ...rootProps
  } = props;

  useAccessibilityLabelWarning({
    componentName: 'Dropdown',
    accessibilityLabel: triggerProp?.accessibilityLabel ?? accessibilityLabel,
    accessibilityLabelledBy: triggerProp?.accessibilityLabelledBy ?? accessibilityLabelledBy,
    requireLabel: true,
  });

  const themeState = useThemeState();
  const options = React.useMemo(() => collectDropdownOptions(children), [children]);

  const [internalSelection, setInternalSelection] = React.useState<readonly string[]>(() => defaultSelectedOptions ?? noSelection);
  const selectedOptions = selectedOptionsProp ?? internalSelection;
  const [lastToggled, setLastToggled] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    options.warnings.forEach((warning) => console.warn(warning));
  }, [options]);
  React.useEffect(() => {
    if (__DEV__ && !multiselect && selectedOptions.filter((value) => options.byValue.has(value)).length > 1) {
      console.warn(
        'Dropdown: more than one value is selected in single mode; only the first selected value that matches an option counts.',
      );
    }
  }, [multiselect, options, selectedOptions]);

  // The controller restores focus to the trigger's own focus target, which exists only after the trigger state below.
  const triggerTarget = React.useRef<FocusTarget | null>(null);
  const [triggerFocus] = React.useState(() => ({
    requestFocus: (intent?: FocusIntent) => triggerTarget.current?.requestFocus(intent) ?? unmounted,
  }));

  const controller = useDropdownController({ defaultOpen, disabled, onOpenChange, open, triggerFocusTarget: triggerFocus });
  const { closeForSelect, openFromKey, setExpanded } = controller;

  const latestSelection = React.useRef({ selectedOptions, onSelectedOptionsChange, multiselect, options, disabled });
  React.useLayoutEffect(() => {
    latestSelection.current = { selectedOptions, onSelectedOptionsChange, multiselect, options, disabled };
  });

  const changeSelection = React.useCallback((next: string[], value: string) => {
    const current = latestSelection.current;
    if (sameSelection(current.selectedOptions, next)) {
      return;
    }
    setInternalSelection(next);
    current.onSelectedOptionsChange?.(next, { value });
  }, []);

  const commit = React.useCallback(
    (value: string) => {
      changeSelection([value], value);
      closeForSelect();
    },
    [changeSelection, closeForSelect],
  );

  const onOptionActivate = React.useCallback(
    (value: string) => {
      const { disabled: isDisabled, multiselect: multiple, selectedOptions: selection } = latestSelection.current;
      if (isDisabled) {
        return;
      }
      if (!multiple) {
        commit(value);
        return;
      }
      setLastToggled(value);
      changeSelection(selection.includes(value) ? selection.filter((candidate) => candidate !== value) : [...selection, value], value);
    },
    [changeSelection, commit],
  );

  const onOptionSelectionAction = React.useCallback(
    (value: string, action: ListboxItemOptionAction) => {
      const { disabled: isDisabled, multiselect: multiple, options: current, selectedOptions: selection } = latestSelection.current;
      if (isDisabled) {
        return;
      }
      if (!multiple) {
        if (action === 'select' || (action === 'add' && !selection.some((candidate) => current.byValue.has(candidate)))) {
          commit(value);
        }
        return;
      }
      setLastToggled(value);
      if (action === 'select') {
        changeSelection([value], value);
      } else if (action === 'add' && !selection.includes(value)) {
        changeSelection([...selection, value], value);
      } else if (action === 'remove' && selection.includes(value)) {
        changeSelection(
          selection.filter((candidate) => candidate !== value),
          value,
        );
      }
    },
    [changeSelection, commit],
  );

  const displayed = getDisplayedOptions(options, selectedOptions, multiselect);
  const labels = displayed.map((option) => option.label).join(', ');
  const [valueWidth, setValueWidth] = React.useState(0);
  const [measuredWidth, setMeasuredWidth] = React.useState(0);
  const showsCount = multiselect && displayed.length > 1 && valueWidth > 0 && measuredWidth > valueWidth;
  const showsPlaceholder = displayed.length === 0;
  const valueText = showsPlaceholder ? placeholder : showsCount ? formatSelectedCount(displayed.length) : labels;

  const handleKeyDown = React.useCallback(
    (event: FocusKeyboardEvent) => {
      const { key, altKey, ctrlKey, metaKey, shiftKey } = event.nativeEvent;
      if (disabled || altKey || ctrlKey || metaKey || shiftKey) {
        return;
      }
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        openFromKey(key === 'ArrowDown' ? 'first' : 'last');
      }
    },
    [disabled, openFromKey],
  );

  // Windows Fabric dispatches the ExpandCollapse pattern's actions in lowercase; Win32 declares title-case actions.
  const handleAccessibilityAction = React.useCallback(
    (event: AccessibilityActionEvent) => {
      const { actionName } = event.nativeEvent;
      if (Platform.OS === 'windows' && !disabled && (actionName === 'expand' || actionName === 'collapse')) {
        setExpanded(actionName === 'expand');
      }
    },
    [disabled, setExpanded],
  );

  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined);
  const handleTriggerLayout = React.useCallback((event: LayoutChangeEvent) => {
    setTriggerWidth(event.nativeEvent.layout.width);
  }, []);

  const {
    accessibilityState: triggerAccessibilityState,
    keyDownEvents: triggerKeyDownEvents,
    onAccessibilityAction: triggerOnAccessibilityAction,
    onKeyDown: triggerOnKeyDown,
    onLayout: triggerOnLayout,
    onPress: triggerOnPress,
    onPressIn: triggerOnPressIn,
    ref: triggerUserRef,
    style: triggerStyle,
    ...triggerRest
  } = triggerProp ?? {};

  const triggerPropsInput = withTriggerExpandActions<FocusablePressableProps>(
    {
      accessibilityHint,
      accessibilityLabel,
      accessibilityLabelledBy,
      accessible: accessible ?? true,
      focusable,
      testID,
      onBlur,
      onFocus,
      onHoverIn,
      onHoverOut,
      onPressOut,
      ...(triggerRest as FocusablePressableProps),
      accessibilityRole: 'combobox',
      accessibilityState: { ...triggerAccessibilityState, ...accessibilityState, expanded: controller.presented, disabled },
      accessibilityValue: { text: labels },
      disabled,
      enableFocusRing: false,
      keyDownEvents: [...(triggerKeyDownEvents ?? []), ...triggerKeys],
      onAccessibilityAction: composeHandlers(handleAccessibilityAction, triggerOnAccessibilityAction),
      onKeyDown: composeHandlers(triggerOnKeyDown as FocusablePressableProps['onKeyDown'], handleKeyDown),
      onLayout: composeHandlers(triggerOnLayout, handleTriggerLayout),
      onPress: composeHandlers(triggerOnPress, controller.handlePress),
      onPressIn: composeHandlers(controller.handlePressIn, triggerOnPressIn ?? onPressIn),
    } as FocusablePressableProps,
    setExpanded,
  );
  const [pressableProps, pressableState, focusBinding] = useFocusablePressable(triggerPropsInput);

  const { focusTarget, focusTargetRef } = focusBinding;
  React.useLayoutEffect(() => {
    triggerTarget.current = focusTarget;
  }, [focusTarget]);

  const { anchorRef } = controller;
  const triggerRef = React.useCallback(
    (instance: TriggerInstance | null) => {
      const detachFocus = focusTargetRef(instance);
      const detachAnchor = anchorRef(instance);
      return () => {
        if (typeof detachFocus === 'function') detachFocus();
        if (typeof detachAnchor === 'function') detachAnchor();
      };
    },
    [anchorRef, focusTargetRef],
  );

  const focused = pressableState.focused || controller.presented;
  const modality = useRootInputModality(focused && !disabled);
  const focusVisible = focused && !disabled && modality === 'keyboard';
  const { FocusRing } = useFocusVisuals({ focused: focusVisible, useSystemFocusRing: false, alwaysVisible: true });
  const visualState = getVisualState({ disabled, error, focused, pressed: pressableState.pressed, hovered: pressableState.hovered });
  const resolved = getInputResolvedStyles({ ...themeState, size, variant, visualState, focusVisible });

  const root = useSlot(View, rootProps);
  const trigger = useSlot(Pressable, { ...pressableProps, ref: triggerUserRef, style: triggerStyle } as React.ComponentProps<
    typeof Pressable
  >);
  const iconStart = useOptionalSlot(Icon, iconStartProp);
  const chevron = useSlot(Icon, { fontSource: controller.presented ? semanticIconSources.chevronUp : semanticIconSources.chevronDown });
  const value = useSlot(NativeText, { children: valueText, numberOfLines: 1 });
  const underline = useOptionalSlot(View, variant === 'underline' ? {} : null);
  const underlineFocus = useOptionalSlot(View, variant === 'underline' ? {} : null);

  const onValueLayout = React.useCallback((width: number) => setValueWidth(width), []);
  const onMeasureLayout = React.useCallback((width: number) => setMeasuredWidth(width), []);

  return {
    ...themeState,
    FocusRing: variant === 'outline' ? FocusRing : undefined,
    root,
    trigger,
    iconStart,
    chevron,
    value,
    underline,
    underlineFocus,
    variant,
    size,
    disabled,
    error,
    multiselect,
    open: controller.presented,
    visualState,
    focusVisible,
    showsPlaceholder,
    measureText: multiselect && displayed.length > 1 ? labels : undefined,
    onValueLayout,
    onMeasureLayout,
    triggerRef,
    popupProps: {
      ...controller.presence,
      multiselect,
      options,
      selectedOptions,
      lastToggled,
      onOptionActivate,
      onOptionSelectionAction,
      listbox,
      label: triggerProp?.accessibilityLabel ?? accessibilityLabel,
      triggerWidth,
      children,
    },
    resolved,
    chevronColor: getDropdownChevronColor(themeState.tokens, visualState, focusVisible),
    userStyle,
  };
}
