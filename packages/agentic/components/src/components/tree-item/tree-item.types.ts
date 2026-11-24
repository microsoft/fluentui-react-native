import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentState,
  FocusKeyboardEvent,
  FocusTargetBinding,
  OptionalSlot,
  PropsWithRefOf,
  Slot,
  SlotProp,
} from '@fluentui-react-native/framework-base';
import type { ReactNode } from 'react';
import type { Pressable, PressableProps, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { Icon } from '../../primitives/icon/icon';
import type { Avatar } from '../avatar/avatar';
import type { AvatarProps } from '../avatar/avatar.types';
import type { Badge } from '../badge/badge';
import type { BadgeProps } from '../badge/badge.types';
import type { Button } from '../button/button';
import type { Text } from '../text/text';

export type TreeItemLayout = 'standard' | 'avatar' | 'checkbox';
export type TreeItemSize = 'small' | 'medium';
export type TreeItemAppearance = 'subtle' | 'subtleAlpha' | 'transparent';
export type TreeItemChecked = boolean | 'mixed';
export type TreeItemSelectionState = { selected?: boolean; checked?: never } | { checked: TreeItemChecked; selected?: never };
export type TreeItemBranchState = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean, value: string) => void;
  children?: ReactNode;
  onActivate?: never;
};
export type TreeItemLeafState = { expanded?: never; onExpandedChange?: never; children?: never; onActivate?: (value: string) => void };
export type TreeItemPresentation = {
  description?: string;
  icon?: SlotProp<typeof Icon>;
  avatar?: AvatarProps;
  badge?: BadgeProps;
  quickAction?: { label: string; onPress: (value: string) => void };
};

export type TreeItemProps = TreeItemPresentation &
  TreeItemSelectionState &
  (TreeItemBranchState | TreeItemLeafState) &
  DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    value: string;
    label: string;
    level: number;
    position: number;
    setSize: number;
    layout?: TreeItemLayout;
    size?: TreeItemSize;
    appearance?: TreeItemAppearance;
    disabled?: boolean;
    focusable?: boolean;
    primaryTestID?: string;
    onSelection?: (value: string) => void;
  };

export type TreeItemInteraction = Pick<PressableProps, 'onFocus' | 'onBlur'> & {
  onKeyDown?: (event: FocusKeyboardEvent) => void;
  keyDownEvents?: readonly { key: string }[];
};

export type TreeItemState = ThemeState &
  FocusTargetBinding &
  ComponentState<
    FocusVisualsSlots & {
      root: Slot<typeof View>;
      row: Slot<typeof View>;
      primary: Slot<typeof Pressable>;
      disclosure: Slot<typeof View>;
      chevron: OptionalSlot<typeof Icon>;
      mark: OptionalSlot<typeof Icon>;
      icon: OptionalSlot<typeof Icon>;
      avatar: OptionalSlot<typeof Avatar>;
      badge: OptionalSlot<typeof Badge>;
      copy: Slot<typeof View>;
      label: Slot<typeof Text>;
      description: OptionalSlot<typeof Text>;
      action: OptionalSlot<typeof Button>;
      branch: OptionalSlot<typeof View>;
    }
  > & {
    visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
    level: number;
    layout: TreeItemLayout;
    size: TreeItemSize;
    appearance: TreeItemAppearance;
    selected: boolean;
    children?: ReactNode;
    userStyle?: StyleProp<ViewStyle>;
  };
