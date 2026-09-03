import type * as React from 'react';
import type { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OptionalSlotProp,
  OwnedRootProps,
  PressableState,
  PropsOf,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';
import type { Icon } from '../../primitives/icon/icon';
import type { Avatar } from '../avatar/avatar';
import type { Text } from '../text/text';

/**
 * The public slots of an interaction tag. The container root is not interactive; the two action regions are siblings
 * inside it so a press on one never reaches the other.
 */
export type InteractionTagSlots = {
  root: Slot<typeof View>;
  primaryAction: Slot<typeof Pressable>;
  avatar: OptionalSlot<typeof Avatar>;
  leadingIcon: OptionalSlot<typeof Icon>;
  content: OptionalSlot<typeof Text>;
  dismiss: Slot<typeof Pressable>;
  dismissIcon: OptionalSlot<typeof Icon>;
};

/**
 * The rendered slots, including the structural divider that separates the two action regions. The divider is not part
 * of the public API.
 */
export type InteractionTagStateSlots = InteractionTagSlots & {
  divider: Slot<typeof View>;
};

export type InteractionTagAppearance = 'primary' | 'secondary';
export type InteractionTagLayout = 'iconAndText' | 'iconOnly';
export type InteractionTagSize = 'small' | 'medium';
export type InteractionTagShape = 'rounded' | 'circular';

export type InteractionTagStateProps = {
  /**
   * Selects the background, foreground, and divider color family for both action regions.
   */
  appearance?: InteractionTagAppearance;

  /**
   * Blocks both action regions, removes both from the tab order, and selects the disabled colors.
   */
  disabled?: boolean;

  /**
   * `iconOnly` suppresses the content and forces the circular radius.
   */
  layout?: InteractionTagLayout;

  /**
   * Selects the container corner radius in the icon-and-text layout. Ignored in the icon-only layout.
   */
  shape?: InteractionTagShape;

  /**
   * Selects the action padding, the text style, and the leading, avatar, and dismiss glyph sizes.
   */
  size?: InteractionTagSize;
};

export type InteractionTagRootProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessibilityRole' | 'role'>;

/**
 * Props for either action region. Children are owned by the component, so an action slot accepts a props object and
 * never a shorthand child.
 */
export type InteractionTagActionProps = {
  as?: React.ComponentType<PropsOf<typeof Pressable>>;
} & OwnedRootProps<PropsWithRefOf<typeof Pressable>, 'accessibilityRole' | 'role'>;

/**
 * Leading content is an icon or an avatar, never both.
 */
export type InteractionTagLeadingContentProps =
  | { avatar?: OptionalSlotProp<typeof Avatar>; leadingIcon?: never }
  | { avatar?: never; leadingIcon?: OptionalSlotProp<typeof Icon> };

type InteractionTagOwnProps = InteractionTagStateProps &
  Omit<ComponentProps<InteractionTagSlots, InteractionTagRootProps>, 'avatar' | 'dismiss' | 'leadingIcon' | 'primaryAction'> & {
    /**
     * The trailing action region that reports removal. It always needs an `accessibilityLabel`.
     */
    dismiss?: InteractionTagActionProps;

    /**
     * The leading action region that inspects or opens the thing the tag names.
     */
    primaryAction?: InteractionTagActionProps;
  };

export type InteractionTagProps = InteractionTagOwnProps & InteractionTagLeadingContentProps;

export type InteractionTagState = ComponentState<InteractionTagStateSlots> &
  Required<InteractionTagStateProps> &
  Omit<ThemeState, 'appearance'> & {
    dismissFocusVisualProps?: FocusVisualProps;
    dismissState: PressableState;
    hasAvatar: boolean;
    hasContent: boolean;
    hasLeadingContent: boolean;
    hasLeadingIcon: boolean;
    iconOnly: boolean;
    primaryFocusVisualProps?: FocusVisualProps;
    primaryState: PressableState;
    userStyle?: StyleProp<ViewStyle>;
  };
