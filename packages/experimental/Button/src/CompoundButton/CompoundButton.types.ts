import { ViewProps, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { ButtonSlotProps, ButtonTokens, ButtonProps } from '../Button.types';
import { FontTokens } from '@fluentui-react-native/tokens';

export const compoundButtonName = 'CompoundButton';

export interface CompoundButtonTokens extends ButtonTokens {
  secondaryContentFont?: FontTokens;
  secondaryContentColor?: ColorValue;
}

export interface CompoundButtonProps extends ButtonProps {
  /**
   * Second line of text that describes the action this button takes.
   */
  secondaryContent?: string;
}

export interface CompoundButtonSlotProps extends ButtonSlotProps {
  contentContainer: ViewProps;
  secondaryContent: TextProps;
}

export interface CompoundButtonType {
  props: CompoundButtonProps;
  tokens: CompoundButtonTokens;
  slotProps: CompoundButtonSlotProps;
}
