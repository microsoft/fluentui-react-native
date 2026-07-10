import type { Shape } from '@fluentui-react-native/design';
import type { GestureResponderEvent, ViewStyle, StyleProp, PressableProps, TextProps } from 'react-native';
import type { PressableState, SlotComponent } from '@fluentui-react-native/framework-base';

/**
 * Props for the simple {@link Button} component.
 *
 * This is an intentionally minimal, plain react-native implementation used to scaffold the
 * agentic-components library, its tests, and storybook integration.
 */
export type ButtonProps = {
  /** Text label rendered inside the button. */
  title?: string;

  /** Called when the button is pressed. */
  onPress?: (event: GestureResponderEvent) => void;

  /** When true, the button is non-interactive and rendered in a dimmed state. */
  disabled?: boolean;

  /** The shape of the button, controlling its border radius. */
  shape?: Shape;

  /** Optional style override applied to the pressable root. */
  style?: StyleProp<ViewStyle>;

  /** Content can be set via title or via children */
  children?: TextProps['children'];
};

export type ButtonState = PressableState & {
  root: SlotComponent<PressableProps>;
  content: SlotComponent<TextProps>;
  shape: ViewStyle;
};
