import type { Pressable, StyleProp, ViewStyle } from 'react-native';
import type {
  Slot,
  OptionalSlot,
  OwnedRootProps,
  ComponentProps,
  ComponentState,
  PressableState,
  PropsWithRefOf,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { Icon } from '../../primitives/icon/icon';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';
import type { Text } from '../text/text';

export type DestructiveButtonSlots = {
  /**
   * The main container of the destructive button.
   */
  root: Slot<typeof Pressable>;

  /**
   * The label of the destructive button. This slot is optional and requires text to be set in
   * DestructiveButtonProps['content'] for the slot to appear, either by content={"Delete"}
   *   or content={{ children: "Delete" }}
   */
  content: OptionalSlot<typeof Text>;

  /**
   * The icon displayed within the destructive button. This slot is optional and requires an icon
   * to be set in DestructiveButtonProps['icon'] for the slot to appear.
   */
  icon: OptionalSlot<typeof Icon>;
};

export type DestructiveButtonAppearance = 'primary' | 'subtle';
export type DestructiveButtonSize = 'small' | 'medium' | 'large';
export type DestructiveButtonShape = 'rounded' | 'circle';
export type DestructiveButtonIconPosition = 'before' | 'after';

export type DestructiveButtonStateProps = {
  /**
   * Whether the destructive button is disabled.
   */
  disabled?: boolean;
  /**
   * The danger emphasis level of the destructive button.
   */
  appearance?: DestructiveButtonAppearance;
  /**
   * The size of the destructive button.
   */
  size?: DestructiveButtonSize;
  /**
   * The shape of the destructive button.
   */
  shape?: DestructiveButtonShape;
  /**
   * The position of the icon relative to the content.
   */
  iconPosition?: DestructiveButtonIconPosition;
};

/**
 * Props that are exposed from the underlying Pressable component at the top level. A destructive button
 * controls its own children and resolves styles from tokens, so those props are exposed separately.
 */
export type DestructiveButtonExposedPressableProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>, 'accessibilityRole' | 'role'>;

/**
 * Props for the DestructiveButton component, including state props, slot props, and exposed Pressable props.
 */
export type DestructiveButtonProps = DestructiveButtonStateProps &
  ComponentProps<DestructiveButtonSlots, DestructiveButtonExposedPressableProps>;

/**
 * The destructive button state, returned from the useDestructiveButton hook.
 */
export type DestructiveButtonState = ComponentState<DestructiveButtonSlots> &
  Required<DestructiveButtonStateProps> &
  Omit<ThemeState, 'appearance'> &
  PressableState & {
    focusVisualProps?: FocusVisualProps;
    /**
     * Whether the destructive button is displaying only an icon without content. This is set automatically
     * when the button has an icon and no content.
     */
    iconOnly: boolean;
    /**
     * User styling applied after the component's token-derived root styles.
     */
    userStyle?: StyleProp<ViewStyle>;
  };
