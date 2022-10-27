import * as React from 'react';
import {
  useKeyProps,
  useOnPressWithFocus,
  useViewCommandFocus,
  getAccessibilityState,
  useAsPressable,
} from '@fluentui-react-native/interactive-hooks';
import { LinkProps, LinkInfo } from './Link.types';
import { Linking, Platform } from 'react-native';

export const useLink = (props: LinkProps): LinkInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    accessible = true,
    accessibilityRole,
    onKeyDown,
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

  return {
    props: {
      ...rest,
      ...onKeyUpProps,
      ...pressable.props, // allow user key events to override those set by us
      onKeyDown: Platform.OS === (('win32' as any) || 'windows') ? onKeyDown : undefined,
      onMouseEnter: Platform.OS === (('win32' as any) || 'windows') ? pressable.props.onMouseEnter : undefined,
      accessible: accessible,
      accessibilityRole: 'link',
      onAccessibilityTap: onAccTap,
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
