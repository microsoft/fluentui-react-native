import type { FocusTargetBinding } from '@fluentui-react-native/framework-base';
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
import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { Text } from '../text/text';
import type { ButtonTokens } from './button.styles';

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

  leadingIcon: OptionalSlot<typeof Icon>;
  trailingIcon: OptionalSlot<typeof Icon>;
};

export type ButtonAppearance = 'primary' | 'secondary' | 'outline' | 'subtle';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonShape = 'rounded' | 'circular';

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
};

/**
 * Props that are exposed from the underlying Pressable component at the top level. A button controls its
 * own children and resolves styles from tokens, so those props are exposed separately.
 */
export type ButtonExposedPressableProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>>;

/**
 * Props for the Button component, including state props, slot props, and exposed Pressable props.
 */
export type ButtonProps = ButtonStateProps & ComponentProps<ButtonSlots, ButtonExposedPressableProps>;

export type ButtonTokenState = Required<Pick<ButtonStateProps, 'size' | 'shape' | 'appearance'>> & {
  /** Effective interaction presentation; raw interaction fields remain available for behavior. */
  visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
  /** Whether the button has an icon without a label. */
  iconOnly: boolean;
  fluentFallback: boolean;
};

/** The button state, returned from the useButton hook. */
export type ButtonState = ComponentState<ButtonSlots & FocusVisualsSlots> &
  FocusTargetBinding &
  Required<ButtonStateProps> &
  Omit<ThemeState, 'appearance'> &
  PressableState &
  ButtonTokenState & {
    themeState: ThemeState;
    buttonTokens: ButtonTokens;
    /**
     * User styling applied after the component's token-derived root styles.
     */
    userStyle?: StyleProp<ViewStyle>;
  };
