import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { View } from 'react-native';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Icon } from '../../primitives/icon/icon';
import type { RatingItemProps, RatingItemState } from './rating-item.types';

export function useRatingItem({
  fill = 'empty',
  size = 'medium',
  disabled = false,
  preview,
  ref,
  testID,
}: RatingItemProps): RatingItemState {
  const visibleFill = disabled ? fill : (preview ?? fill);
  const showMask = visibleFill === 'half';
  return {
    ...useThemeState(),
    fill: visibleFill,
    size,
    visualState: disabled ? 'disabled' : 'rest',
    root: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none', ref, testID }),
    frame: useSlot(View, {}),
    mask: useOptionalSlot(View, showMask ? {} : null),
    base: useSlot(Icon, hiddenFromAccessibilityProps),
    overlay: useOptionalSlot(Icon, showMask ? hiddenFromAccessibilityProps : null),
  };
}
