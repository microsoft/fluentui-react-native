import * as React from 'react';
import { Linking, Text as NativeText } from 'react-native';
import type { GestureResponderEvent, NativeSyntheticEvent, TargetedEvent } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import type { LinkProps, LinkState } from './link.types';

/**
 * Tracks only the two states a text run can report. There is no hovered level because the target
 * platforms raise no hover events for text, and the public FURN `Link` records that forwarding mouse
 * events to a text root faults on Apple platforms.
 */
function useLinkInteractionState() {
  const [pressed, setPressed] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  return { focused, pressed, setFocused, setPressed };
}

export function useLink_unstable(props: LinkProps): LinkState {
  const {
    accessibilityState,
    content: contentProp,
    disabled = false,
    icon: iconProp,
    inline = false,
    onBlur,
    onFocus,
    onNavigationError,
    onPress,
    onPressIn,
    onPressOut,
    ref: rootRef,
    style: userStyle,
    typeSet = 'functional',
    url,
    ...rest
  } = props;

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Link',
    requireLabel: contentProp === null,
    warning: 'Link: a link without label content requires an accessibilityLabel that describes the destination.',
  });

  const themeState = useThemeState();
  const { focused, pressed, setFocused, setPressed } = useLinkInteractionState();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      // The caller's handler always runs, whether or not a destination is set, so delegated navigation
      // and platform navigation stay composable.
      onPress?.(event);
      if (url === undefined) {
        return;
      }
      // The rejection is only intercepted when the caller asked for it. Without a handler it is left
      // alone rather than absorbed, so a failed navigation surfaces instead of looking like a link
      // that simply did nothing.
      const navigation = Linking.openURL(url);
      if (onNavigationError) {
        void navigation.catch(onNavigationError);
      }
    },
    [onNavigationError, onPress, url],
  );

  const handlePressIn = React.useCallback(
    (event: GestureResponderEvent) => {
      setPressed(true);
      onPressIn?.(event);
    },
    [onPressIn, setPressed],
  );

  const handlePressOut = React.useCallback(
    (event: GestureResponderEvent) => {
      setPressed(false);
      onPressOut?.(event);
    },
    [onPressOut, setPressed],
  );

  const handleFocus = React.useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus, setFocused],
  );

  const handleBlur = React.useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur, setFocused],
  );

  const rootProps = {
    ...rest,
    accessibilityRole: 'link' as const,
    accessibilityState: { ...accessibilityState, disabled },
    accessible: rest.accessible ?? true,
    focusable: rest.focusable ?? !disabled,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onPress: disabled ? undefined : handlePress,
    onPressIn: disabled ? undefined : handlePressIn,
    onPressOut: disabled ? undefined : handlePressOut,
    ref: rootRef,
  };

  const root = useSlot(NativeText, rootProps);
  // The default props object is created per render because slot props are assigned in place.
  const content = useOptionalSlot(NativeText, contentProp, { defaultProps: { children: 'Link' }, renderByDefault: true });
  const icon = useOptionalSlot(Icon, iconProp, { renderByDefault: false });

  return {
    root,
    content,
    icon,
    disabled,
    focused,
    inline,
    pressed,
    typeSet,
    underlined: inline || pressed || focused,
    userStyle,
    ...themeState,
  };
}
