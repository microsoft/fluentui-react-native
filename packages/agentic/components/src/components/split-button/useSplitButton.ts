import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { commandPressProps } from '../button/commandPress';
import { useButton_unstable } from '../button/useButton';
import { useMenuButton_unstable } from '../menu-button/useMenuButton';
import type { SplitButtonProps, SplitButtonState } from './split-button.types';

export function useSplitButton_unstable({
  content,
  menuLabel,
  children,
  menu,
  onPress,
  open,
  defaultOpen,
  onOpenChange,
  appearance = 'secondary',
  size = 'medium',
  shape = 'rounded',
  disabled = false,
  primaryTestID,
  menuTriggerTestID,
  style: userStyle,
  ...rootProps
}: SplitButtonProps): SplitButtonState {
  const primary = useButton_unstable({
    ...commandPressProps(onPress, disabled),
    content: { ...hiddenFromAccessibilityProps, children: content },
    appearance,
    size,
    shape,
    disabled,
    testID: primaryTestID,
  });
  const menuButton = useMenuButton_unstable({
    appearance,
    size,
    disabled,
    testID: menuTriggerTestID,
    accessibilityLabel: menuLabel,
    children,
    menu: { accessibilityLabel: menuLabel, ...menu },
    open,
    defaultOpen,
    onOpenChange,
  });
  return {
    ...useThemeState(),
    size,
    shape,
    appearance,
    userStyle,
    primary,
    menuButton,
    hasNames: !!content.trim() && !!menuLabel.trim(),
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    divider: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none' }),
  };
}
