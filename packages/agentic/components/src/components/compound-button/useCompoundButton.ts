import { Image, View } from 'react-native';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { useButton_unstable } from '../button/useButton';
import { Text } from '../text/text';
import type { CompoundButtonProps, CompoundButtonState } from './compound-button.types';

export function useCompoundButton_unstable({
  content,
  contentStyle,
  image,
  secondaryContent,
  secondaryContentStyle,
  ...buttonProps
}: CompoundButtonProps): CompoundButtonState {
  const button = useButton_unstable({
    ...buttonProps,
    content: { children: content, ...hiddenFromAccessibilityProps, style: [{ textAlign: 'auto' }, contentStyle] },
    accessibilityHint: secondaryContent,
  });
  return {
    ...button,
    image: useOptionalSlot(Image, image ? { source: image, ...hiddenFromAccessibilityProps, resizeMode: 'cover' } : null),
    textStack: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none' }),
    description: useSlot(Text, { ...hiddenFromAccessibilityProps, children: secondaryContent }),
    secondaryContentStyle,
  };
}
