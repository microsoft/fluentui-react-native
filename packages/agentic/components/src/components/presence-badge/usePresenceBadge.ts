import { useThemeState } from '@fluentui-react-native/design';
import { useSlot } from '@fluentui-react-native/framework-base';
import { View } from 'react-native';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Icon } from '../../primitives/icon/icon';
import type { PresenceBadgeProps, PresenceBadgeState } from './presence-badge.types';

export function usePresenceBadge_unstable({
  ref,
  testID,
  nativeID,
  size = 'medium',
  status = 'available',
  style: userStyle,
}: PresenceBadgeProps): PresenceBadgeState {
  return {
    ...useThemeState(),
    size,
    status,
    userStyle,
    root: useSlot(View, { ref, testID, nativeID, ...hiddenFromAccessibilityProps, focusable: false, pointerEvents: 'none' }),
    mark: useSlot(Icon, hiddenFromAccessibilityProps),
  };
}
