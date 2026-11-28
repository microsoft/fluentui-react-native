import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { Avatar } from '../avatar/avatar';
import { commandPressProps } from '../button/commandPress';
import { useButton_unstable } from '../button/useButton';
import type { InteractionTagProps, InteractionTagState } from './interaction-tag.types';

export function useInteractionTag_unstable({
  content,
  accessibilityLabel,
  dismissLabel,
  onPress,
  onDismiss,
  appearance = 'secondary',
  size = 'medium',
  shape = 'rounded',
  disabled = false,
  leadingIcon,
  avatar,
  primaryTestID,
  dismissTestID,
  style: userStyle,
  ...rootProps
}: InteractionTagProps): InteractionTagState {
  const text = content?.trim() ? content : undefined;
  const name = accessibilityLabel?.trim() ? accessibilityLabel : text;
  const portrait =
    avatar?.image !== undefined
      ? { image: { source: avatar.image } }
      : avatar?.initials !== undefined
        ? { initials: avatar.initials }
        : avatar?.icon !== undefined
          ? { icon: avatar.icon }
          : null;
  const primary = useButton_unstable({
    ...commandPressProps(onPress, disabled),
    content: text ? { ...hiddenFromAccessibilityProps, children: text } : undefined,
    accessibilityLabel: name,
    leadingIcon,
    disabled,
    size,
    shape,
    testID: primaryTestID,
  });
  const remove = useButton_unstable({
    ...commandPressProps(onDismiss, disabled),
    leadingIcon: { ...hiddenFromAccessibilityProps, fontSource: semanticIconSources.dismiss },
    accessibilityLabel: dismissLabel,
    disabled,
    size,
    shape,
    testID: dismissTestID,
  });
  return {
    ...useThemeState(),
    appearance,
    size,
    shape,
    primary,
    remove,
    userStyle,
    named: !!name && !!dismissLabel.trim() && !!(text || leadingIcon || portrait),
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    divider: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none' }),
    avatar: useOptionalSlot(
      Avatar,
      portrait ? { ...portrait, size: size === 'small' ? 16 : 20, accessible: false, pointerEvents: 'none' } : null,
    ),
  };
}
