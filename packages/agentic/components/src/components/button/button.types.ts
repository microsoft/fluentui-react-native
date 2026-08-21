import type { Pressable, PressableProps, StyleProp, Text, ViewStyle } from 'react-native';
import type {
  Slot,
  OptionalSlot,
  OwnedRootProps,
  ComponentProps,
  ComponentState,
  PressableState,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { Icon } from '../../primitives/icon/icon';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

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

  /**
   * Optional filled icon displayed in place of `icon` while the button is selected.
   */
  selectedIcon: OptionalSlot<typeof Icon>;
};

type ButtonStateSlots = ButtonSlots & {
  contentHidden: OptionalSlot<typeof Text>;
};

export type ButtonAppearance = 'primary' | 'secondary' | 'outline' | 'subtle';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonShape = 'rounded' | 'square' | 'circle';
export type ButtonIconPosition = 'before' | 'after';

export type ButtonStateProps = {
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
  /**
   * The appearance style of the button.
   */
  appearance?: ButtonAppearance;
  /**
   * The size of the button.
   */
  size?: ButtonSize;
  /**
   * The shape of the button.
   */
  shape?: ButtonShape;
  /**
   * The position of the icon relative to the button content.
   */
  iconPosition?: ButtonIconPosition;
  /**
   * Whether the button renders as selected. Supplying this prop enables toggle-button accessibility semantics.
   * Selection is externally driven: the button never changes it on press, because a press is an action rather than a
   * state change. Own the value in the caller and update it from `onPress`.
   */
  selected?: boolean;
};

/**
 * Props that are exposed from the underlying Pressable component at the top level. A button controls its
 * own children and resolves styles from tokens, so those props are exposed separately.
 */
export type ButtonExposedPressableProps = OwnedRootProps<PressableProps>;

/**
 * Props for the Button component, including state props, slot props, and exposed Pressable props.
 */
export type ButtonProps = ButtonStateProps & ComponentProps<ButtonSlots, ButtonExposedPressableProps>;

/**
 * The button state, returned from the useButton hook
 */
export type ButtonState = ComponentState<ButtonStateSlots> &
  Required<ButtonStateProps> &
  ThemeState &
  PressableState & {
    focusVisualProps?: FocusVisualProps;
    /**
     * Whether the button is displaying only an icon without text. This is set automatically when the button
     * has an icon and no content.
     */
    iconOnly: boolean;
    /**
     * Whether selected-state semantics are enabled.
     */
    isToggleButton: boolean;
    /**
     * User styling applied after the component's token-derived root styles.
     */
    userStyle?: StyleProp<ViewStyle>;
  };
