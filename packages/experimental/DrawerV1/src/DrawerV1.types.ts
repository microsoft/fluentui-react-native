import type { ColorValue, ScrollViewProps } from 'react-native';

import type { IconProps } from '@fluentui-react-native/icon';
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
}

export interface DrawerV1Info {
  props: DrawerV1Props & { iconProps: IconProps } & React.ComponentPropsWithRef<any>;
  state: FocusState & { text: string };
}

export interface DrawerV1SlotProps {
  root: ScrollViewProps;
}

export interface DrawerV1Type {
  props: DrawerV1Props;
  tokens: DrawerV1Tokens;
  slotProps: DrawerV1SlotProps;
}
