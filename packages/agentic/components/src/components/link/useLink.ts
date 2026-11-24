import { Linking, Pressable } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useFocusablePressable, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import { isNavigationPress } from './linkActivation';
import type { LinkProps, LinkState } from './link.types';

export function useLink_unstable({
  content,
  url,
  onNavigate,
  typography = 'functional',
  disabled,
  trailingIcon,
  style: userStyle,
  ...rootProps
}: LinkProps): LinkState {
  const validDestination = url !== undefined ? !!url.trim() && onNavigate === undefined : typeof onNavigate === 'function';
  const enabled = !disabled && validDestination && !!content.trim();
  useAccessibilityLabelWarning({
    componentName: 'Link',
    requireLabel: true,
    accessibilityLabel: validDestination && content.trim() ? content : undefined,
    warning: 'Link: provide nonblank destination text and exactly one navigation target.',
  });
  const navigate = () => {
    if (!enabled) return;
    if (url !== undefined) {
      void Linking.openURL(url).catch(() => console.warn('Link: the platform could not open the URL.'));
    } else {
      onNavigate?.();
    }
  };
  const [interaction, pressable, focus] = useFocusablePressable({
    ...rootProps,
    accessible: true,
    accessibilityLabel: content,
    accessibilityRole: 'link',
    accessibilityState: { disabled: !enabled },
    disabled: !enabled,
    focusable: enabled,
    onPress: (event) => {
      if (isNavigationPress(event)) navigate();
    },
    onAccessibilityTap: navigate,
  });
  const { FocusRing, ...nativeFocus } = useFocusVisuals({ focused: pressable.focused && enabled });
  return {
    ...useThemeState(),
    ...focus,
    FocusRing,
    typography,
    visualState: !enabled ? 'disabled' : pressable.pressed ? 'pressed' : pressable.hovered ? 'hovered' : 'rest',
    userStyle,
    root: useSlot(Pressable, { ...interaction, ...nativeFocus, ref: rootProps.ref }),
    content: useSlot(Text, { ...hiddenFromAccessibilityProps, children: content }),
    trailingIcon: useOptionalSlot(Icon, trailingIcon, {
      transform: (props) => ({ ...props, ...hiddenFromAccessibilityProps }),
    }),
  };
}
