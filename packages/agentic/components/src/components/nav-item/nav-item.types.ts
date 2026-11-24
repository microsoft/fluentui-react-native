import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentState,
  FocusTargetBinding,
  OptionalSlot,
  PropsWithRefOf,
  Slot,
  SlotProp,
} from '@fluentui-react-native/framework-base';
import type { Pressable, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { Icon } from '../../primitives/icon/icon';
import type { Avatar } from '../avatar/avatar';
import type { AvatarProps } from '../avatar/avatar.types';
import type { Badge } from '../badge/badge';
import type { BadgeProps } from '../badge/badge.types';
import type { Text } from '../text/text';

export type NavItemDensity = 'comfortable' | 'compact';
export type NavItemNesting = 'top-level' | 'subitem';
export type NavItemLeading = { kind: 'icon'; icon: SlotProp<typeof Icon> } | { kind: 'avatar'; avatar: AvatarProps };
export type NavItemAction = { key: string; label: string; onPress: () => void };
export type NavItemBehavior =
  | {
      type?: 'item';
      current?: boolean;
      currentDescription?: string;
      onNavigate: (value: string) => void;
      expanded?: never;
      carriedCurrent?: never;
      onExpandedChange?: never;
    }
  | {
      type: 'category';
      expanded: boolean;
      onExpandedChange: (expanded: boolean) => void;
      carriedCurrent?: boolean;
      current?: never;
      currentDescription?: never;
      onNavigate?: never;
    };

export type NavItemProps = NavItemBehavior &
  DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    value: string;
    label: string;
    density?: NavItemDensity;
    nesting?: NavItemNesting;
    disabled?: boolean;
    iconOnly?: boolean;
    leading?: NavItemLeading;
    badge?: BadgeProps;
    secondaryActions?: readonly NavItemAction[];
    primary?: Partial<Pick<PropsWithRefOf<typeof Pressable>, 'ref'>> & Pick<ViewProps, 'testID' | 'accessibilityHint'>;
  };

export type NavItemState = ThemeState &
  FocusTargetBinding &
  ComponentState<
    FocusVisualsSlots & {
      root: Slot<typeof View>;
      primary: Slot<typeof Pressable>;
      icon: OptionalSlot<typeof Icon>;
      avatar: OptionalSlot<typeof Avatar>;
      label: OptionalSlot<typeof Text>;
      badge: OptionalSlot<typeof Badge>;
      chevron: OptionalSlot<typeof Icon>;
      indicator: OptionalSlot<typeof View>;
    }
  > & {
    density: NavItemDensity;
    nesting: NavItemNesting;
    highlighted: boolean;
    disabled: boolean;
    visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
    userStyle?: StyleProp<ViewStyle>;
    actions: readonly NavItemAction[];
  };
