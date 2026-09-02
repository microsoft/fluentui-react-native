import type * as React from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { AvatarSize } from '../avatar/avatar.types';
import type { Text } from '../text/text';

export type AvatarGroupSize = AvatarSize;
export type AvatarGroupLayout = 'spread' | 'stack';

export type AvatarGroupSlots = {
  root: Slot<typeof View>;

  /**
   * The trailing `+N` indicator container. It renders only when `overflowCount` is positive and the group
   * is larger than size `16`.
   */
  overflow: OptionalSlot<typeof View>;
};

type AvatarGroupStateSlots = AvatarGroupSlots & {
  overflowText: OptionalSlot<typeof Text>;
};

export type AvatarGroupStateProps = {
  /**
   * How the items are positioned relative to each other. `spread` separates them with a size-scaled gap,
   * and `stack` overlaps them and paints a size-scaled separation ring between them.
   *
   * @default spread
   */
  layout?: AvatarGroupLayout;

  /**
   * The number of members that are not rendered. A positive value appends the `+N` indicator.
   *
   * @default 0
   */
  overflowCount?: number;

  /**
   * The diameter the group lays out for. It resolves the group's own geometry only, so each child Avatar
   * still needs the same `size`.
   *
   * @default 40
   */
  size?: AvatarGroupSize;
};

export type AvatarGroupRootProps = OwnedRootProps<PropsWithRefOf<typeof View>>;

export type AvatarGroupProps = AvatarGroupStateProps &
  ComponentProps<AvatarGroupSlots, AvatarGroupRootProps> & {
    /** The visible Avatar items, in the order they should be laid out. */
    children?: React.ReactNode;
  };

export type AvatarGroupState = ComponentState<AvatarGroupStateSlots> &
  Required<AvatarGroupStateProps> &
  ThemeState & {
    /** The recursively flattened sequence of visible items and their stable wrapper keys. */
    items: readonly { key: React.Key; node: React.ReactNode }[];

    /** Accessibility props applied to every item box while the root owns the group's accessible name. */
    itemAccessibilityProps?: ViewProps;

    /** Style applied to every item box after the first, resolved by `useAvatarGroupStyles_unstable`. */
    itemOffsetStyle?: StyleProp<ViewStyle>;

    /** Style applied to the box wrapping each item, resolved by `useAvatarGroupStyles_unstable`. */
    itemStyle?: StyleProp<ViewStyle>;

    /** The rendered indicator text, saturated at `+99`. Empty while no indicator renders. */
    overflowLabel: string;

    userStyle?: StyleProp<ViewStyle>;
  };
