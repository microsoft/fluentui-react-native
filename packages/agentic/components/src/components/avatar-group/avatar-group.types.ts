import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { ImageSourcePropType, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { IconProps } from '../../primitives/icon/icon.types';
import type { AvatarProps, AvatarSize } from '../avatar/avatar.types';
import type { Text } from '../text/text';

export type AvatarGroupSize = AvatarSize;

type MemberIcon = Extract<IconProps, { imageSource: unknown } | { fontSource: unknown } | { svgSource: unknown }>;
type Portrait =
  | { image: ImageSourcePropType; initials?: never; icon?: never }
  | { image?: never; initials: string; icon?: never }
  | { image?: never; initials?: never; icon: MemberIcon };

export type AvatarGroupMember = { key: string; name: string; avatar: Portrait };
export type AvatarGroupOverflow = { text: string; accessibilityLabel: string };

export type AvatarGroupProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID' | 'accessibilityLabel'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    members?: readonly AvatarGroupMember[];
    size?: AvatarGroupSize;
    formatOverflow?: (count: number) => AvatarGroupOverflow;
    decorative?: boolean;
  };

export type AvatarGroupState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    overflow: OptionalSlot<typeof View>;
    count: OptionalSlot<typeof Text>;
  }> & {
    size: AvatarGroupSize;
    visibleMembers: readonly { key: string; avatar: AvatarProps }[];
    userStyle?: StyleProp<ViewStyle>;
  };
