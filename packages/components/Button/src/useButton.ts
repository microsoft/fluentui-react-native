import * as React from 'react';
import { Platform } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';
import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { isHighContrast } from '@fluentui-react-native/theming-utils';

import type { ButtonProps, ButtonInfo } from './Button.types';

export const useButton = (props: ButtonProps): ButtonInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    onClick,
    accessible,
    accessibilityRole,
    componentRef = defaultComponentRef,
    disabled,
    loading,
    enableFocusRing,
    focusable,
    ...rest
  } = props;

  const isDisabled = !!disabled || !!loading;
  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled ? null : componentRef;
  const onClickWithFocus = useOnPressWithFocus(focusRef, onClick);
  const pressable = usePressableState({ ...rest, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(onClick, ' ', 'Enter');
  const hasTogglePattern = props.accessibilityActions && !!props.accessibilityActions.find((action) => action.name === 'Toggle');

  const theme = useFluentTheme();
  const shouldUseTwoToneFocusBorder = Platform.OS === ('win32' as any) && props.appearance === 'primary' && !isHighContrast(theme);

  const [baseHeight, setBaseHeight] = React.useState<number | undefined>(undefined);
  const [baseWidth, setBaseWidth] = React.useState<number | undefined>(undefined);
  const onLayout = React.useCallback(
    (e: LayoutEvent) => {
      // Only run when shouldUseTwoToneFocusBorder so that state update doesn't
      // affect platforms that don't need it.
      if (shouldUseTwoToneFocusBorder) {
        setBaseHeight(e.nativeEvent.layout.height);
        setBaseWidth(e.nativeEvent.layout.width);
      }
    },
    [setBaseHeight, setBaseWidth, shouldUseTwoToneFocusBorder],
  );

  return {
    props: {
      ...onKeyUpProps,
      ...pressable.props, // allow user key events to override those set by us
      /**
       * https://github.com/facebook/react-native/issues/34986
       * Due to a bug in React Native, unconditionally passing this may cause unnecessary re-renders.
       * Therefore, let's only pass it in if it's defined to limit this issue.
       */
      ...(isDisabled && { disabled: isDisabled }),
      accessible: accessible ?? true,
      accessibilityRole: accessibilityRole || 'button',
      onAccessibilityTap: props.onAccessibilityTap || (!hasTogglePattern ? props.onClick : undefined),
      accessibilityLabel: props.accessibilityLabel,
      enableFocusRing: enableFocusRing ?? !shouldUseTwoToneFocusBorder,
      focusable: focusable ?? !isDisabled,
      ref: useViewCommandFocus(componentRef),
      iconPosition: props.iconPosition || 'before',
      loading,
      onLayout,
    },
    state: {
      ...pressable.state,
      measuredWidth: baseWidth,
      measuredHeight: baseHeight,
      shouldUseTwoToneFocusBorder: shouldUseTwoToneFocusBorder,
    },
  };
};
