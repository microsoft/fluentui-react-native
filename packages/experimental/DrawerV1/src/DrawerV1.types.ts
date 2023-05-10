import type { Animated, ColorValue, ModalProps, TouchableWithoutFeedbackProps, ViewProps } from 'react-native';

import type { PressableFocusProps } from '@fluentui-react-native/interactive-hooks';
import type { FocusState } from '@fluentui-react-native/interactive-hooks/lib/usePressableState.types';
import type { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const DrawerV1Name = 'DrawerV1';

export interface DrawerV1CoreTokens extends LayoutTokens, IBorderTokens, IColorTokens, FontTokens {
  /**
   * The icon color.
   */
  iconColor?: ColorValue;
}

export interface DrawerV1Tokens extends DrawerV1CoreTokens {
  /**
   * States that can be applied to an DrawerV1.
   */
  hasIcon?: DrawerV1Tokens;
}

export interface DrawerV1Props extends PressableFocusProps {
  /*
   ** An accessibility label for screen readers. Set on the text DrawerV1.
   */
  accessibilityLabel?: string;

  isVisible?: boolean;
  onClose?: () => void;
  handleClose?: () => void;
  handleBackdropPress?: () => void;
  animatedElevation?: any;
  animatedStyle?: any;
  animatedOpacity?: any;
  position?: any;
  children?: React.ReactNode;
}

export interface DrawerV1Info {
  props: DrawerV1Props;
  state: FocusState & { text: string };
}

export interface DrawerV1SlotProps {
  root: ViewProps;
  modal: ModalProps;
  backdrop: TouchableWithoutFeedbackProps;
  backdropContent: Animated.AnimatedProps<ViewProps>;
  content: Animated.AnimatedProps<ViewProps>;
  dragger: ViewProps;
}

export interface DrawerV1Type {
  props: DrawerV1Props;
  tokens: DrawerV1Tokens;
  slotProps: DrawerV1SlotProps;
}
