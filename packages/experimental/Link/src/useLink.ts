import * as React from 'react';
import {
  useAsPressable,
  useKeyProps,
  useOnPressWithFocus,
  useViewCommandFocus,
  getAccessibilityState,
} from '@fluentui-react-native/interactive-hooks';
import { LinkProps, LinkInfo } from './Link.types';
import { Linking, Platform } from 'react-native';

export const useLink = (props: LinkProps): LinkInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    accessible = true,
    accessibilityRole,
    onKeyUp,
    onKeyDown,
    keyUpEvents,
    keyDownEvents,
    onPress,
    onAccessibilityTap,
    tooltip,
    url,
    accessibilityState,
    componentRef = defaultComponentRef,
    disabled,
    enableFocusRing,
    focusable,
    ...rest
  } = props;
  const isDisabled = !!disabled;

  const [visitedState, setVisitedState] = React.useState(false);
  const linkOnPress = React.useCallback(
    (e) => {
      setVisitedState(true);
      if (url) {
        Linking.openURL(url as string);
      } else if (onPress) {
        onPress(e);
      }
      e.stopPropagation();
    },
    [setVisitedState, url, onPress],
  );

  // GH #1336: Set focusRef to null if link is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled && !focusable ? null : componentRef;
  const onPressWithFocus = useOnPressWithFocus(focusRef, linkOnPress);
  const pressable = useAsPressable({ ...rest, disabled: isDisabled, onPress: onPressWithFocus });
  const onKeyUpProps = useKeyProps(linkOnPress, ' ', 'Enter');

  const newState = {
    ...pressable.state,
    visited: visitedState,
  };
  const onAccTap = React.useCallback(
    (e?) => {
      onAccessibilityTap ? onAccessibilityTap() : linkOnPress(e);
    },
    [linkOnPress, onAccessibilityTap],
  );

  const linkTooltip = tooltip ?? url ?? undefined;

  /*These callbacks are not implemented on iOS/macOS, and cause Redboxes if passed in. Limit to only windows/win32 for now*/
  const isWinPlatform = Platform.OS === (('win32' as any) || 'windows');
  const filteredProps = {
    onKeyUp: isWinPlatform ? onKeyUp : undefined,
    keyUpEvents: isWinPlatform ? keyUpEvents : undefined,
    validKeysUp: undefined,
    onKeyDown: isWinPlatform ? onKeyDown : undefined,
    keyDownEvents: isWinPlatform ? keyDownEvents : undefined,
    validKeysDown: undefined,
    onMouseEnter: isWinPlatform ? pressable.props.onMouseEnter : undefined,
    onMouseLeave: isWinPlatform ? pressable.props.onMouseLeave : undefined,
    onAccessibilityTap: isWinPlatform ? onAccTap : undefined,
  };

  return {
    props: {
      ...rest,
      ...onKeyUpProps,
      ...pressable.props, // allow user key events to override those set by us
      ...filteredProps,
      accessible: accessible,
      accessibilityRole: 'link',
      accessibilityState: getAccessibilityState(isDisabled, accessibilityState),
      enableFocusRing: enableFocusRing ?? true,
      focusable: focusable ?? !isDisabled,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      ref: useViewCommandFocus(componentRef),
      tooltip: linkTooltip,
    },
    state: newState,
  };
};
