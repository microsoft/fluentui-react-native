import type { Text, Pressable, PressableProps } from 'react-native';
import type { Slot, OptionalSlot, ComponentProps, ComponentState, PressableState } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { Icon } from '../icon/icon';

export type ButtonSlots = {
  /**
   * The main container type of the button
   */
  root: Slot<typeof Pressable>;

  /**
   * The main content of the button, typically text. This slot is optional and requires text
   * to be set in ButtonProps['content'] for the slot to appear, either by content={"My Button"}
   *   or content={{ children: "My Button" }}
   */
  content: OptionalSlot<typeof Text>;

  /**
   * The icon displayed within the button. This slot is optional and requires an icon
   * to be set in ButtonProps['icon'] for the slot to appear.
   */
  icon: OptionalSlot<typeof Icon>;
};

export type ButtonStateProps = {
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
  /**
   * The appearance style of the button.
   */
  appearance?: 'primary' | 'secondary' | 'outline' | 'subtle';
  /**
   * The size of the button.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * The shape of the button.
   */
  shape?: 'rounded' | 'square' | 'circle';
  /**
   * The position of the icon relative to the button content.
   */
  iconPosition?: 'before' | 'after';
};

/**
 * Props that are exposed from the underlying Pressable component at the top level. A button controls its
 * own children so the 'children' prop is omitted from the exposed Pressable props.
 */
export type ButtonExposedPressableProps = Omit<PressableProps, 'children'>;

/**
 * Props for the Button component, including state props, slot props, and exposed Pressable props.
 */
export type ButtonProps = ButtonStateProps & ComponentProps<ButtonSlots, ButtonExposedPressableProps>;

/**
 * The button state, returned from the useButton hook
 */
export type ButtonState = ComponentState<ButtonSlots> &
  Required<ButtonStateProps> &
  ThemeState &
  PressableState & {
    /**
     * Whether the button is displaying only an icon without text. This is set automatically when the button
     * has an icon and no content.
     */
    iconOnly?: boolean;
  };
