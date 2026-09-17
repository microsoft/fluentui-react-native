import { Pressable, View, useWindowDimensions } from 'react-native';
import type { PressableProps } from 'react-native';

import { type PropsWithRefOf, usePressableState, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { resolveFocusable } from '../../common/interaction';
import type { CardProps, CardState } from './card.types';

const horizontalCollapseWidth = 480;

/**
 * Hook to create the state for a Card component.
 */
export function useCard_unstable(props: CardProps): CardState {
  const {
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityState,
    accessible,
    android_ripple,
    delayLongPress,
    delayPressIn,
    disabled = false,
    direction = 'vertical',
    focusable,
    footer: footerProp,
    header: headerProp,
    layout = 'default',
    onBlur,
    onFocus,
    onHoverIn,
    onHoverOut,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    padding = 'default',
    pressRetentionOffset,
    ref: rootRef,
    selected,
    size = 'small',
    style: userStyle,
    testID,
    unstable_pressDelay,
    content: contentProp,
    content02: content02Prop,
    ...rest
  } = props;

  // Selection is externally driven; the card renders the value it is given and reports presses through onPress.
  const isSelectable = selected !== undefined;
  const isInteractive = onPress !== undefined || isSelectable;
  const { width } = useWindowDimensions();
  const resolvedDirection = direction === 'horizontal' && width < horizontalCollapseWidth ? 'vertical' : direction;
  const themeState = useThemeState();

  const [overlayProps, pressableState] = usePressableState({
    ...rest,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    role: 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
      ...(isSelectable && { selected }),
    },
    accessible: true,
    android_ripple,
    delayLongPress,
    delayPressIn,
    disabled: !isInteractive || disabled,
    focusable: isInteractive && resolveFocusable(focusable, disabled),
    onBlur,
    onFocus,
    onHoverIn,
    onHoverOut,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    pressRetentionOffset,
    unstable_pressDelay,
  } as PressableProps);

  const rootProps: PropsWithRefOf<typeof View> = isInteractive
    ? ({ ...rest, accessible: false, accessibilityState: { ...accessibilityState, disabled }, ref: rootRef, testID } as PropsWithRefOf<
        typeof View
      >)
    : ({
        ...rest,
        accessibilityLabel,
        accessibilityLabelledBy,
        accessibilityState: {
          ...accessibilityState,
          disabled,
        },
        accessible: accessible ?? false,
        role: (accessible ?? false) ? 'group' : undefined,
        focusable: false,
        ref: rootRef,
        testID,
      } as PropsWithRefOf<typeof View>);

  const root = useSlot(View, rootProps);
  const overlay = useOptionalSlot(Pressable, isInteractive ? overlayProps : null);
  const header = useOptionalSlot(View, headerProp);
  const content = useSlot(View, contentProp);
  const content02 = useOptionalSlot(View, content02Prop);
  const footer = useOptionalSlot(View, footerProp);

  return {
    root,
    overlay,
    header,
    content,
    content02,
    footer,
    disabled,
    direction,
    layout,
    padding,
    resolvedDirection,
    selected: selected ?? false,
    size,
    hovered: pressableState.hovered,
    pressed: pressableState.pressed,
    focused: pressableState.focused,
    isInteractive,
    isSelectable,
    userStyle,
    ...themeState,
  };
}
