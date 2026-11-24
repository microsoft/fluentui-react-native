import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { Icon } from '../../primitives/icon/icon';

export type PresenceBadgeStatus = 'available' | 'busy' | 'doNotDisturb' | 'away' | 'offline' | 'outOfOffice';
export type PresenceBadgeSize = 'extraSmall' | 'small' | 'medium' | 'large';
export type PresenceBadgeProps = Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
  ref?: PropsWithRefOf<typeof View>['ref'];
  size?: PresenceBadgeSize;
  status?: PresenceBadgeStatus;
};

export type PresenceBadgeState = ThemeState &
  Required<Pick<PresenceBadgeProps, 'size' | 'status'>> &
  ComponentState<{ root: Slot<typeof View>; mark: Slot<typeof Icon> }> & { userStyle?: StyleProp<ViewStyle> };
