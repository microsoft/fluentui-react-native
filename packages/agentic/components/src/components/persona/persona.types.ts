import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { AvatarGroupMember } from '../avatar-group/avatar-group.types';
import type { Avatar } from '../avatar/avatar';
import type { AvatarSize } from '../avatar/avatar.types';
import type { PresenceBadge } from '../presence-badge/presence-badge';
import type { PresenceBadgeStatus } from '../presence-badge/presence-badge.types';
import type { Text } from '../text/text';

export type PersonaLayout = 'beforeAvatar' | 'afterAvatar' | 'belowAvatar';
export type PersonaAlignment = 'top' | 'center';
export type PersonaPresence = { status: PresenceBadgeStatus; label: string };
export type PersonaAvatar = AvatarGroupMember['avatar'];
export type PersonaIdentity = {
  name: string;
  secondaryText?: string;
  tertiaryText?: string;
  quaternaryText?: string;
  presenceLabel?: string;
};

export type PersonaProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    name: string;
    secondaryText?: string;
    tertiaryText?: string;
    quaternaryText?: string;
    avatar?: PersonaAvatar;
    size?: AvatarSize;
    layout?: PersonaLayout;
    alignment?: PersonaAlignment;
    presence?: PersonaPresence;
    decorative?: boolean;
    formatIdentity?: (identity: PersonaIdentity) => string;
  };

export type PersonaState = ThemeState &
  Required<Pick<PersonaProps, 'layout' | 'alignment' | 'size'>> &
  ComponentState<{
    root: Slot<typeof View>;
    portrait: Slot<typeof View>;
    avatar: Slot<typeof Avatar>;
    presence: OptionalSlot<typeof PresenceBadge>;
    textColumn: Slot<typeof View>;
    name: Slot<typeof Text>;
    secondary: OptionalSlot<typeof Text>;
    tertiary: OptionalSlot<typeof Text>;
    quaternary: OptionalSlot<typeof Text>;
  }> & { userStyle?: StyleProp<ViewStyle>; hasName: boolean };
