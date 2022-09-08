import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { LinkProps, LinkState } from './Link.types';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState, Linking, Platform } from 'react-native';

export const useLink = (props: LinkProps): LinkState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const {onPress, onAccessibilityTap, url, accessibilityState, componentRef = defaultComponentRef, disabled, enableFocusRing, focusable, ...rest } = props;
  const isDisabled = !!disabled;

  const [visitedState, setVisitedState] = React.useState({ visited: false });
  const linkOnPress = React.useCallback(
    (e) => {
      if (!disabled) {
        setVisitedState({ visited: true });
        if (url) {
          Linking.openURL(url as string);
        } else if (onPress) {
          onPress(e);
        }
        e.stopPropagation();
      }
    }, [disabled, setVisitedState, url, onPress],
  );


  // GH #1336: Set focusRef to null if link is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled ? null : componentRef;
  const onPressWithFocus = useOnPressWithFocus(focusRef, linkOnPress);
  const pressable = useAsPressable({ ...rest, disabled: isDisabled, onPress: onPressWithFocus });
  const onKeyUpProps = useKeyProps(linkOnPress, ' ', 'Enter');

  const newState = {
    ...pressable.state,
    ...visitedState

  };
  const onAccTap = React.useCallback(
    (e?) => {
      onAccessibilityTap ? onAccessibilityTap() : linkOnPress(e);
    },
    [linkOnPress, onAccessibilityTap],
  );

  return {
    props: {
      ...rest,
      ...onKeyUpProps,
      ...pressable.props, // allow user key events to override those set by us
      accessible: true,
      accessibilityRole: 'link',
      ...(Platform.OS === (('win32' as any) || 'windows') && { onAccessibilityTap: onAccTap }),
      accessibilityState: getAccessibilityState(isDisabled, accessibilityState),
      enableFocusRing: enableFocusRing ?? true,
      focusable: focusable ?? !isDisabled,
      ref: useViewCommandFocus(componentRef),
    },
    state: newState,
  };
};

/* Copied from useButton. Move to sharable location */
const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, ...accessibilityState };
  }
  return { disabled: disabled };
}
