import type { ColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native';

type FocusVisualOwnedProps =
  | 'accessibilityElementsHidden'
  | 'accessible'
  | 'children'
  | 'collapsable'
  | 'focusable'
  | 'importantForAccessibility'
  | 'pointerEvents';

export type FocusVisualRingProps = Omit<ViewProps, FocusVisualOwnedProps>;

export type FocusVisualProps = FocusVisualRingProps & {
  /**
   * Optional inner ring. Supplying it creates a dual-ring focus visual.
   */
  inner?: FocusVisualRingProps | null;
  /**
   * Whether the mounted focus visual is visible.
   */
  visible?: boolean;
};

export type FocusVisualOptions = {
  borderRadius?: ViewStyle['borderRadius'];
  innerColor?: ColorValue;
  innerWidth?: ViewStyle['borderWidth'];
  outerColor: ColorValue;
  outerWidth: ViewStyle['borderWidth'];
  visible: boolean;
};

export type FocusVisualStyles = {
  inner?: StyleProp<ViewStyle>;
  outer: StyleProp<ViewStyle>;
};
